import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { createStripePaymentSession } from "@/lib/stripe/CreateReservation";
import { ActionType, InvoiceStatus, MeterStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const cookie = req.cookies.get("auth_token")?.value;

    if (!cookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJsonWebtoken(cookie);
    if (!payload || typeof payload === "string") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = (payload as any).userId || (payload as any).id;

    const { meterId, boatId }: { meterId: number; boatId: number } = await req.json();

    if (!meterId || !boatId) {
        return NextResponse.json({ error: "meterId og boatId er påkrævet" }, { status: 400 });
    }

    // Verify meter is still available
    const meter = await prisma.meter.findUnique({
        where: { id: meterId },
        include: { sessions: { where: { isActive: true } } },
    });

    if (!meter) {
        return NextResponse.json({ error: "Måler ikke fundet" }, { status: 404 });
    }
    if (meter.status !== MeterStatus.ONLINE) {
        return NextResponse.json({ error: "Måleren er ikke online" }, { status: 409 });
    }
    if (meter.sessions.length > 0) {
        return NextResponse.json({ error: "Måleren er allerede i brug" }, { status: 409 });
    }

    const boat = await prisma.boat.findFirst({
        where: { id: boatId, userId },
    });

    if (!boat) {
        return NextResponse.json({ error: "Båden tilhører ikke din konto" }, { status: 403 });
    }


    const latestReading = await prisma.meterReading.findFirst({
        where: { meterId },
        orderBy: { date: "desc" },
    });

    const session = await prisma.meterSession.create({
        data: {
            meterId,
            userId,
            boatId,
            type: meter.type,
            startValue: latestReading?.value ?? 0,
            isActive: true,
        },
    });

    await prisma.invoice.updateMany({
        where: { 
            userId: userId,
            status: InvoiceStatus.PENDING,
            meterSessionId: null
        },
        data: {
            meterSessionId: session.id
        }
    });

    await prisma.auditLog.create({
        data: {
            userId,
            action: ActionType.CONNECTED_METER,
            details: `Bruger startede session på måler ${meter.id} (Båd: ${boat.kaldeNavn})`,
        },
    });

    const url = await createStripePaymentSession({
        userId,
        email: (payload as any).email,
        amount: 20000, 
        description: `Reservation for måler ${meter.deviceId} (Båd: ${boat.kaldeNavn})`,
        type: meter.type,
    }).catch((err) => {
        return NextResponse.json({ error: "Kunne ikke oprette betalingssession. Prøv igen." }, { status: 500 });
    }) as { url: string } | undefined;

    return NextResponse.json({ session, url: url?.url }, { status: 201 });
}
