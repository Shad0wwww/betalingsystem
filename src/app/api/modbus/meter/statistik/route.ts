import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { MeterStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const aktivemeters = await prisma.meter.count({
        select: {
            _all: true,
        },
        where: {
            status: MeterStatus.ONLINE,
        },
    });

    const totalMeters = await prisma.meter.count();

    return NextResponse.json({ activeMeters: aktivemeters._all, totalMeters: totalMeters });
}
