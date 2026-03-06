import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { GetUser } from "@/lib/users/GetUser";
import { ActionType, MeterStatus, Role, UtilityType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const authToken =
        req.headers.get("authorization")?.replace("Bearer ", "") ??
        req.cookies.get("auth_token")?.value;

    const { 
        deviceId, 
        status, 
        location,
        type
     }: { deviceId: string; status: MeterStatus; location: string, type: UtilityType } = await req.json();

    if (!authToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!deviceId || !status || !type) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    if (await prisma.meter.findUnique({ where: { deviceId } })) {
        return NextResponse.json({ error: "Meter with this deviceId already exists" }, { status: 400 });
    }

    await prisma.meter.create({
        data: {
            deviceId,
            status,
            location,
            type
        }
    });

    await prisma.auditLog.create({
        data: {
            action: ActionType.CREATE_METER,
            userId: payload.userId,
            details: `Oprettede måler med deviceId: ${deviceId}, status: ${status}, location: ${location}, type: ${type}`,
        },
    });

    return NextResponse.json({ message: "Meter created successfully" });

}
