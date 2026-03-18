import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { ActionType, MeterStatus, UtilityType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

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
            userId: result.user.userId,
            details: `Opdaterede måler #${id}: deviceId=${deviceId}, status=${status}, location=${location}, type=${type}`,
        },
    });

    return NextResponse.json({ meter: updated });
}
