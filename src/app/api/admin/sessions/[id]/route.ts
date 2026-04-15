import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const result = await validateAdminSession(req);
    if ("error" in result) return result.error;

    const { id } = await params;
    const sessionId = parseInt(id);
    if (isNaN(sessionId)) {
        return NextResponse.json({ error: "Ugyldigt session-ID" }, { status: 400 });
    }

    // Fetch session with relations
    const session = await prisma.meterSession.findUnique({
        where: { id: sessionId },
        include: {
            user: { select: { id: true, name: true, email: true } },
            boat: { select: { id: true, kaldeNavn: true, skibModel: true } },
            meter: { select: { id: true, deviceId: true, location: true, type: true } },
        },
    });

    if (!session) {
        return NextResponse.json({ error: "Session ikke fundet" }, { status: 404 });
    }

    // Fetch latest meter reading for current and spot price
    const latestReading = await prisma.meterReading.findFirst({
        where: { meterId: session.meterId },
        orderBy: { date: "desc" },
        select: { value: true, date: true, spotPris: true },
    });

    // Transform the response
    const sessionData = {
        id: session.id,
        userId: session.userId,
        userName: session.user.name,
        userEmail: session.user.email,
        boatId: session.boat.id,
        boatName: session.boat.kaldeNavn,
        boatModel: session.boat.skibModel,
        meterId: session.meter.id,
        meterDeviceId: session.meter.deviceId,
        meterType: session.meter.type,
        meterLocation: session.meter.location,
        startTime: session.startTime.toISOString(),
        startValue: session.startValue,
        endTime: session.endTime?.toISOString() ?? null,
        endValue: session.endValue,
        isActive: session.isActive,
        currentKwh: latestReading?.value ?? null,
        spotPris: latestReading?.spotPris ?? null,
    };

    return NextResponse.json({ session: sessionData });
}
