// lib/services/invoiceService.ts
import prisma from "@/lib/prisma";
import { createPaymentLink } from "@/lib/stripe/CreatePaymentLink";

import { UtilityType, InvoiceStatus } from "@prisma/client";
import { Stripe } from "stripe";

export class InvoiceService {
    static async createInvoiceWithPayment(
        userId: number,
        amount: number,
        type: UtilityType,
        description: string
    ) {
        const invoice = await prisma.invoice.create({
            data: {
                amount,
                userId,
                currency: "dkk",
                status: InvoiceStatus.PENDING,
                type,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        const paymentLink = await createPaymentLink({
            amount,
            description,
            metadata: { userId: userId.toString(), invoiceId: invoice.id.toString() },
        });

        await prisma.invoice.update({
            where: { id: invoice.id },
            data: { stripePaymentIntentId: paymentLink.id },
        });

        return paymentLink.url;
    }

    static async handleCheckoutSuccess(session: Stripe.Checkout.Session) {
        const invoiceId = session.metadata?.invoiceId;
        const paymentIntentId = session.payment_intent as string;

        if (!invoiceId) {
            console.error("Webhook Error: No invoiceId found in session metadata");
            return;
        }

        try {
            const updatedInvoice = await prisma.invoice.update({
                where: { id: parseInt(invoiceId) },
                data: {
                    status: InvoiceStatus.PAID,
                    paidAt: new Date(),
                    stripePaymentIntentId: paymentIntentId,
                },
            });

            console.log(`✅ Faktura ${invoiceId} markeret som betalt for bruger ${updatedInvoice.userId}`);
            return updatedInvoice;
        } catch (error) {
            console.error(`❌ Fejl ved opdatering af faktura ${invoiceId}:`, error);
            throw error;
        }
    }

    static async markAsPaid(invoiceId: string, paymentIntentId: string) {
        return await prisma.invoice.update({
            where: { id: parseInt(invoiceId) },
            data: {
                status: InvoiceStatus.PAID,
                paidAt: new Date(),
                stripePaymentIntentId: paymentIntentId,
            },
        });
    }
}