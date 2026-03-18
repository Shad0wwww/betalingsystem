import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { ActionType, MeterStatus, UtilityType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const { deviceId, status, location, type }: {
        deviceId: string;
        status: MeterStatus;
        location: string;
        type: UtilityType;
    } = await req.json();

    if (!deviceId || !status || !type) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (await prisma.meter.findUnique({ where: { deviceId } })) {
        return NextResponse.json({ error: "Meter with this deviceId already exists" }, { status: 400 });
    }

    await prisma.meter.create({
        data: { deviceId, status, location, type },
    });

    await prisma.auditLog.create({
        data: {
            action: ActionType.CREATE_METER,
            userId: result.user.userId,
            details: `Oprettede måler med deviceId: ${deviceId}, status: ${status}, location: ${location}, type: ${type}`,
        },
    });

    return NextResponse.json({ message: "Meter created successfully" });
}
