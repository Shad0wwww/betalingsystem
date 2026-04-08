import { ActionType, InvoiceStatus, TransactionType, UtilityType } from '@prisma/client';
import prisma from "../prisma";
import getStripe from "./Stripe";
import { sendEmail } from "../emailer/Mail";
import { uploadFile } from "../cloudflare/Upload";
import { generateInvoiceEmailContent } from "../emailer/MailCreatorInvoice";
import { log } from 'console';

const MINIMUM_CAPTURE_AMOUNT_ORE = 250; // Stripe minimum for DKK captures (2.50 kr)

export async function takeMoneyUsed(
    userId: string,
    paymentIntentId: string,
    amountUsed: number,
    originalReservedAmount: number,
    type: UtilityType
): Promise<{ success: true; capturedAmount: number }> {

    const amountUsedWithMoms = amountUsed * 1.25;
    const roundedAmountUsedWithMoms = Math.ceil(amountUsedWithMoms);
    const captureAmountOre = Math.max(roundedAmountUsedWithMoms, MINIMUM_CAPTURE_AMOUNT_ORE);

    const capturedIntent = await getStripe().paymentIntents.capture(paymentIntentId, {
        amount_to_capture: captureAmountOre,
    }).catch((error) => {
        console.error("Failed to capture Stripe payment intent:", error);
        throw new Error("Failed to capture payment");
    });

    const [updatedInvoice] = await Promise.all([
        prisma.invoice.update({
            where: { stripePaymentIntentId: paymentIntentId },
            data: {
                status: InvoiceStatus.PAID,
                amount: captureAmountOre,
                paidAt: new Date(),
            },
        }),
        prisma.user.update({
            where: { id: userId },
            data: {
                reservedBalance: 0,
            },
        }),
        log(
            ActionType.PAYMENT_MADE,
            userId,
            `Captured ${(captureAmountOre / 100).toFixed(2)} DKK (reserved ${(originalReservedAmount / 100).toFixed(2)} DKK) for PaymentIntent ${paymentIntentId}`
        ),
        prisma.transaction.create({
            data: {
                userId,
                amount: captureAmountOre / 100,
                type: TransactionType.PAID,
                stripeSessionId: paymentIntentId,
            },
        }),
    ]);

    const fileKey = updatedInvoice.InvoiceNumber ?? capturedIntent.id;
    sendInvoiceNotification(userId, captureAmountOre / 100, capturedIntent.id, fileKey, type).catch((error) => {
        console.error("Failed to send invoice notification:", error);
    });

    return { success: true, capturedAmount: captureAmountOre };
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