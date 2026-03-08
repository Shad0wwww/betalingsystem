import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
import { ActionType, MeterStatus, Role, UtilityType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authToken =
        req.headers.get("authorization")?.replace("Bearer ", "") ??
        req.cookies.get("auth_token")?.value;

    if (!authToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJsonWebtoken(authToken);
    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!GetUser.doesUserExistByEmail(payload.email)) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if ((payload as any).role !== Role.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) {
        return NextResponse.json({ error: "Ugyldigt måler-ID" }, { status: 400 });
    }

    const { deviceId, status, location, type }: {
        deviceId: string;
        status: MeterStatus;
        location: string;
        type: UtilityType;
    } = await req.json();

    if (!deviceId || !status || !type) {
        return NextResponse.json({ error: "Manglende påkrævede felter" }, { status: 400 });
    }

    const existing = await prisma.meter.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: "Måler ikke fundet" }, { status: 404 });
    }

    if (deviceId !== existing.deviceId) {
        const conflict = await prisma.meter.findUnique({ where: { deviceId } });
        if (conflict) {
            return NextResponse.json({ error: "En måler med dette device ID eksisterer allerede" }, { status: 400 });
        }
    }

    const updated = await prisma.meter.update({
        where: { id },
        data: { deviceId, status, location, type },
    });

    await prisma.auditLog.create({
        data: {
            action: ActionType.UPDATE_METER,
            userId: payload.userId,
            details: `Opdaterede måler #${id}: deviceId=${deviceId}, status=${status}, location=${location}, type=${type}`,
        },
    });

    return NextResponse.json({ meter: updated });
}
