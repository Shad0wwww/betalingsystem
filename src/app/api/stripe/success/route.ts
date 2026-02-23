import { uploadFile } from '@/lib/cloudflare/Upload';
import { sendEmail } from "@/lib/emailer/Mail";
import { generateInvoiceEmailContent } from "@/lib/emailer/MailCreatorInvoice";
import prisma from "@/lib/prisma";
import getStripe from "@/lib/stripe/Stripe";
import { InvoiceStatus, TransactionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest
) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
        return NextResponse.json(
            { error: "Missing session_id" },
            { status: 400 }
        );
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
        await handleInvoiceUpdate(sessionId, InvoiceStatus.FAILED, "");
        return NextResponse.redirect(new URL("/dashboard?payment=failed&reason=payment_not_completed", request.url));
    }

    const email = session.customer_details?.email;
    const userId = parseInt(session.metadata?.userId!);

    const amount = (session.amount_total! / 100)

    if (!email) {
        return NextResponse.redirect(
            new URL("/dashboard?payment=failed&reason=missing_user_email", request.url)
        );
    }

    const InvoiceNumber = `INV-${new Date().getFullYear()}-${sessionId.slice(-6).toUpperCase()}`;
    
    const emailContent = await generateInvoiceEmailContent(amount, session.metadata?.type!, email, new Date(), InvoiceNumber);

    Promise.all([
        handleInvoiceUpdate(sessionId, InvoiceStatus.PAID, InvoiceNumber),

        prisma.user.update({
            where: { email: email! },
            data: { balance: { increment: amount } }
        }),

        handleTransactionUpdate(userId, sessionId, amount, TransactionType.DEPOSIT),

        sendEmail(email, "Invoice Generated", emailContent),

        uploadFile({
            name: `invoices/${InvoiceNumber}.html`,
            buffer: Buffer.from(emailContent, "utf-8"),
        })
    ]);
    




    return NextResponse.redirect(new URL("/dashboard?payment=success", request.url));

}


async function handleInvoiceUpdate(
    sessionId: string,
    status: InvoiceStatus,
    InvoiceNumber: string
) {
    await prisma.invoice.update({
        where: { stripePaymentIntentId: sessionId },
        data: { status: status, InvoiceNumber: InvoiceNumber, paidAt: new Date() }
    });
}

async function handleTransactionUpdate(
    userid: number,
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

