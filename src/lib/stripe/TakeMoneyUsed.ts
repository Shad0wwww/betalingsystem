import { ActionType, InvoiceStatus, TransactionType } from "@prisma/client";
import prisma from "../prisma";
import getStripe from "./Stripe";
import { sendEmail } from "../emailer/Mail";
import { uploadFile } from "../cloudflare/Upload";
import { generateInvoiceEmailContent } from "../emailer/MailCreatorInvoice";



export async function takeMoneyUsed(
    userId: string,
    paymentIntentId: string,
    amountUsed: number,
    originalReservedAmount: number
) {

    const amountInCents = Math.round(amountUsed * 100);
    try {
        const capturedIntent = await getStripe().paymentIntents.capture(paymentIntentId, {
            amount_to_capture: amountInCents,
        });

        await Promise.all([
            prisma.invoice.update({
                where: { stripePaymentIntentId: paymentIntentId },
                data: {
                    status: InvoiceStatus.PAID,
                    amount: amountUsed, // Opdater til det faktiske beløb
                    paidAt: new Date()
                }
            }),

            prisma.user.update({
                where: { id: userId },
                data: {
                    reservedBalance: { decrement: originalReservedAmount }
                }
            }),

            prisma.auditLog.create({
                data: {
                    userId,
                    action: ActionType.PAYMENT_MADE,
                    details: `Captured payment of ${amountUsed} DKK (originally reserved ${originalReservedAmount} DKK) for PaymentIntent ${paymentIntentId}`,
                },
            }),

            prisma.transaction.create({
                data: {
                    userId: userId,
                    amount: amountUsed,
                    type: TransactionType.PAID,
                    stripeSessionId: paymentIntentId, 
                    createdAt: new Date(),
                }
            })
        ]);

        return { success: true, capturedAmount: amountUsed };

    } catch (error) {
        console.error("Error capturing payment intent:", error);
        throw new Error("Failed to capture payment");
    }

}

async function emailUser(
    userId: string, 
    amount: number,
    invoiceNumber: string,

) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        console.error("User not found for email notification:", userId);
        return;
    }

    // const emailContent = generateInvoiceEmailContent({
    //     name: user.name,
    //     amount: amount,
    //     invoiceNumber: invoiceNumber,
    //     date: new Date().toLocaleDateString("da-DK"),
    // });


    // await sendEmail(user.email, "Reservation Confirmed", emailContent),
    
    // await uploadFile({
    //     name: `invoices/${InvoiceNumber}.html`,
    //     buffer: Buffer.from(emailContent, "utf-8"),
    // }),


}