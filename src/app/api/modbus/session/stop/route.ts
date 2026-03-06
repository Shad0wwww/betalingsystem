import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import getStripe from "@/lib/stripe/Stripe";
import { takeMoneyUsed } from "@/lib/stripe/TakeMoneyUsed";
import { ActionType, InvoiceStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Ends the user's active session
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

    const { sessionId }: { sessionId: number } = await req.json();

    if (!sessionId) {
        return NextResponse.json({ error: "sessionId er påkrævet" }, { status: 400 });
    }

    const session = await prisma.meterSession.findFirst({
        where: { id: sessionId, userId, isActive: true },
    });

    if (!session) {
        return NextResponse.json({ error: "Aktiv session ikke fundet" }, { status: 404 });
    }

    const updated = await prisma.meterSession.update({
        where: { id: sessionId },
        data: { isActive: false, endTime: new Date() },
    });

    await prisma.auditLog.create({
        data: {
            userId,
            action: ActionType.DISCONNECTED_METER,
            details: `Bruger afsluttede session på måler ${session.meterId} (Båd: ${session.boatId})`,
        },
    });

    const pendingInvoice = await prisma.invoice.findFirst({
        where: { 
            userId: userId, 
            status: InvoiceStatus.PENDING,
            meterSessionId: sessionId
        },
        orderBy: { createdAt: "desc" }
    });

    if (!pendingInvoice || !pendingInvoice.stripePaymentIntentId) {
        return NextResponse.json({ error: "Kunne ikke finde en aktiv betalingsreservation" }, { status: 400 });
    }
        

    const paymentResult = await takeMoneyUsed(
        userId,
        pendingInvoice.stripePaymentIntentId, 
        45.5,                 
        pendingInvoice.amount
    );
    

    return NextResponse.json({ session: updated });
}



