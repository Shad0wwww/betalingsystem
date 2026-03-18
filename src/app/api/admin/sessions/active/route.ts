import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;

    const [total, sessions] = await Promise.all([
        prisma.meterSession.count({ where: { isActive: true } }),
        prisma.meterSession.findMany({
            where: { isActive: true },
            orderBy: { startTime: "asc" },
            skip,
            take: limit,
            include: {
                user: { select: { id: true, name: true, email: true } },
                boat: { select: { kaldeNavn: true, skibModel: true } },
                meter: { select: { deviceId: true, location: true } },
            },
        }),
    ]);

    const data = sessions.map((s) => ({
        id: s.id,
        userId: s.user.id,
        userName: s.user.name,
        userEmail: s.user.email,
        boatName: s.boat.kaldeNavn,
        boatModel: s.boat.skibModel,
        meterDeviceId: s.meter.deviceId,
        meterLocation: s.meter.location,
        type: s.type,
        startValue: s.startValue,
        startTime: s.startTime.toISOString(),
    }));

    return NextResponse.json({ data, total, page, limit });
}
