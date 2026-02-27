import { uploadFile } from '@/lib/cloudflare/Upload';
import { sendEmail } from "@/lib/emailer/Mail";
import { generateInvoiceEmailContent } from "@/lib/emailer/MailCreatorInvoice";
import { generateReservationEmailContent } from '@/lib/emailer/MailReservation';
import prisma from "@/lib/prisma";
import getStripe from "@/lib/stripe/Stripe";
import { InvoiceStatus, TransactionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest
) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    const URL_LINK = process.env.URL_BASE || "https://web.pins.dk";

    if (!sessionId) {
        return NextResponse.json(
            { error: "Missing session_id" },
            { status: 400 }
        );
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (!session || session.status !== "complete") {
        await handleInvoiceUpdate(sessionId, InvoiceStatus.FAILED, "", null);
        return NextResponse.redirect(new URL("/dashboard?payment=failed&reason=payment_not_completed", URL_LINK));
    }

    const email: string = session.customer_details?.email!;
    const userId: string = session.metadata?.userId!;
    const amount = (session.amount_total! / 100);

    const paymentIntentId = session.payment_intent as string;

    if (!email) {
        return NextResponse.redirect(
            new URL("/dashboard?payment=failed&reason=missing_user_email", URL_LINK)
        );
    }

    const InvoiceNumber = `INV-${new Date().getFullYear()}-${sessionId.slice(-6).toUpperCase()}`;

    const emailContent = await generateReservationEmailContent(amount, session.metadata?.type!, email, new Date(), InvoiceNumber);

    await Promise.all([
        handleInvoiceUpdate(sessionId, InvoiceStatus.PENDING, InvoiceNumber, paymentIntentId), 

        prisma.user.update({
            where: { id: userId },
            data: { reservedBalance: { increment: amount } }
        }),

        handleTransactionUpdate(userId, sessionId, amount, TransactionType.RESERVED),

        sendEmail(email, "Reservation Confirmed", emailContent),

        uploadFile({
            name: `invoices/${InvoiceNumber}.html`,
            buffer: Buffer.from(emailContent, "utf-8"),
        })
    ]);

    return NextResponse.redirect(new URL("/dashboard?payment=success", URL_LINK));
}

async function handleInvoiceUpdate(
    sessionId: string,
    status: InvoiceStatus,
    InvoiceNumber: string,
    paymentIntentId: string | null 
) {
    await prisma.invoice.update({
        where: { stripeSessionId: sessionId },
        data: {
            status: status,
            InvoiceNumber: InvoiceNumber,
            stripePaymentIntentId: paymentIntentId, 
            paidAt: new Date()
        }
    });
}

async function handleTransactionUpdate(
    userid: string,
    sessionId: string,
    amount: number,
    type: TransactionType
) {
    await prisma.transaction.create({
        data: {
            userId: userid,
            stripeSessionId: sessionId,
            amount: amount,
            type: type, 
            createdAt: new Date(),
        }
    });
}