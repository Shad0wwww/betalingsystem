import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { takeMoneyUsed } from "@/lib/stripe/TakeMoneyUsed";
import { ActionType, InvoiceStatus, UtilityType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type JwtPayload = { userId?: string; id?: string };

const RATE_PER_HOUR = 45.5;

export async function POST(req: NextRequest) {
    const cookie = req.cookies.get("auth_token")?.value;

    if (!cookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJsonWebtoken(cookie);
    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { userId, id } = payload as JwtPayload;
    const resolvedUserId = userId ?? id;

    if (!resolvedUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId }: { sessionId: number } = await req.json();

    if (!sessionId) {
        return NextResponse.json({ error: "sessionId er påkrævet" }, { status: 400 });
    }

    const session = await prisma.meterSession.findFirst({
        where: { id: sessionId, userId: resolvedUserId, isActive: true },
    });

    if (!session) {
        return NextResponse.json({ error: "Aktiv session ikke fundet" }, { status: 404 });
    }

    const endTime = new Date();

    const [updated] = await Promise.all([
        prisma.meterSession.update({
            where: { id: sessionId },
            data: { isActive: false, endTime },
        }),
        prisma.auditLog.create({
            data: {
                userId: resolvedUserId,
                action: ActionType.DISCONNECTED_METER,
                details: `Bruger afsluttede session på måler ${session.meterId} (Båd: ${session.boatId})`,
            },
        }),
    ]);

    const pendingInvoice = await prisma.invoice.findFirst({
        where: {
            userId: resolvedUserId,
            status: InvoiceStatus.PENDING,
            meterSessionId: sessionId,
        },
        orderBy: { createdAt: "desc" },
    });

    if (!pendingInvoice?.stripePaymentIntentId) {
        return NextResponse.json({ error: "Kunne ikke finde en aktiv betalingsreservation" }, { status: 400 });
    }

    await takeMoneyUsed(
        resolvedUserId,
        pendingInvoice.stripePaymentIntentId,
        calculateAmountUsed(session.startTime, endTime),
        pendingInvoice.amount,
        UtilityType.ELECTRICITY
    );

    return NextResponse.json({ session: updated });
}

function calculateAmountUsed(startTime: Date, endTime: Date): number {
    const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return Math.round(durationInHours * RATE_PER_HOUR * 100);
}