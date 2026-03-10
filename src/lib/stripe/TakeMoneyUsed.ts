import { ActionType, InvoiceStatus, TransactionType, UtilityType } from '@prisma/client';
import prisma from "../prisma";
import getStripe from "./Stripe";
import { sendEmail } from "../emailer/Mail";
import { uploadFile } from "../cloudflare/Upload";
import { generateInvoiceEmailContent } from "../emailer/MailCreatorInvoice";

export async function takeMoneyUsed(
    userId: string,
    paymentIntentId: string,
    amountUsed: number,
    originalReservedAmount: number,
    type: UtilityType
): Promise<{ success: true; capturedAmount: number }> {

    const amountUsedWithMoms = amountUsed * 1.25;
    const roundedAmountUsedWithMoms = Math.ceil(amountUsedWithMoms);
    const capturedIntent = await getStripe().paymentIntents.capture(paymentIntentId, {
        amount_to_capture: roundedAmountUsedWithMoms,
    }).catch((error) => {
        console.error("Failed to capture Stripe payment intent:", error);
        throw new Error("Failed to capture payment");
    });

    const [updatedInvoice] = await Promise.all([
        prisma.invoice.update({
            where: { stripePaymentIntentId: paymentIntentId },
            data: {
                status: InvoiceStatus.PAID,
                amount: roundedAmountUsedWithMoms,
                paidAt: new Date(),
            },
        }),
        prisma.user.update({
            where: { id: userId },
            data: {
                reservedBalance: 0,
            },
        }),
        prisma.auditLog.create({
            data: {
                userId,
                action: ActionType.PAYMENT_MADE,
                details: `Captured ${roundedAmountUsedWithMoms} DKK (reserved ${originalReservedAmount} DKK) for PaymentIntent ${paymentIntentId}`,
            },
        }),
        prisma.transaction.create({
            data: {
                userId,
                amount: roundedAmountUsedWithMoms / 100,
                type: TransactionType.PAID,
                stripeSessionId: paymentIntentId,
            },
        }),
    ]);

    const fileKey = updatedInvoice.InvoiceNumber ?? capturedIntent.id;
    sendInvoiceNotification(userId, roundedAmountUsedWithMoms / 100, capturedIntent.id, fileKey, type).catch((error) => {
        console.error("Failed to send invoice notification:", error);
    });

    return { success: true, capturedAmount: roundedAmountUsedWithMoms };
}

async function sendInvoiceNotification(
    userId: string,
    amount: number,
    paymentIntentId: string,
    fileKey: string,
    type: UtilityType
): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        console.error("User not found for invoice notification:", userId);
        return;
    }

    const emailContent = await generateInvoiceEmailContent(
        amount,
        type,
        user.email,
        new Date(),
        fileKey
    );

    await Promise.all([
        sendEmail(user.email, "Reservation Confirmed", emailContent),
        uploadFile({
            name: `invoices/${fileKey}.html`,
            buffer: Buffer.from(emailContent, "utf-8"),
        }),
    ]);
}