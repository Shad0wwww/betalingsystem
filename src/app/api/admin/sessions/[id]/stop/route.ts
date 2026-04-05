import { validateAdminSession } from "@/lib/session/validateRequest";
import prisma from "@/lib/prisma";
import { ActionType, MeterStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logs/auditlogger";

export async function POST(
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

    const body = await req.json().catch(() => ({}));
    const stopComment = body.stopComment || "";

    // Find the session
    const session = await prisma.meterSession.findUnique({
        where: { id: sessionId },
        include: { user: { select: { id: true, name: true } }, meter: { select: { deviceId: true } } },
    });

    if (!session) {
        return NextResponse.json({ error: "Session ikke fundet" }, { status: 404 });
    }

    if (!session.isActive) {
        return NextResponse.json({ error: "Session er allerede stoppet" }, { status: 400 });
    }

    // Get latest meter reading for endValue
    const latestReading = await prisma.meterReading.findFirst({
        where: { meterId: session.meterId },
        orderBy: { date: "desc" },
        select: { value: true },
    });

    const endValue = latestReading?.value ?? session.startValue;
    const endTime = new Date();

    // Update session and meter status
    const [updatedSession] = await Promise.all([
        prisma.meterSession.update({
            where: { id: sessionId },
            data: {
                isActive: false,
                endTime,
                endValue,
            },
        }),
        prisma.meter.update({
            where: { id: session.meterId },
            data: { status: MeterStatus.ONLINE },
        }),
        log(
            ActionType.SESSION_FORCE_STOPPED,
            result.user.userId,
            `Admin stoppede session #${sessionId} (Bruger: ${session.user.name}, Måler: ${session.meter.deviceId})${stopComment ? `. Årsag: ${stopComment}` : ""}`,
        ),
    ]);

    return NextResponse.json({ session: updatedSession });
}
