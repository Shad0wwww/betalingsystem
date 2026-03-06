import 'server-only';
import { $Enums, ActionType, InvoiceStatus, UtilityType } from "@prisma/client";
import getStripe from '@/lib/stripe/Stripe';
import prisma from '@/lib/prisma';
import { GetUser } from '@/lib/users/GetUser';
import { createStripeCustomer } from '@/lib/stripe/CreateCustomer';

interface CreatePaymentParams {
    userId: string;
    email: string;
    amount: number;
    description: string;
    type: $Enums.UtilityType;
}


export async function createStripePaymentSession({
    userId,
    email,
    amount,
    description,
    type
}: CreatePaymentParams) {

    const user = await GetUser.byEmail(email);
    if (!user) {
        throw new Error("User not found");
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
        const stripeCustomer = await createStripeCustomer(user.email, user.name, user.phone);
        customerId = stripeCustomer.id;

        await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customerId },
        });
    }



    // 2. Opret Stripe Checkout Session
    
    const session = await getStripe().checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        mode: "payment",
        payment_intent_data: {
            capture_method: "manual", 
        },
        line_items: [
            {
                price_data: {
                    currency: "dkk",
                    unit_amount: amount,
                    product_data: {
                        name: description,
                    },
                },
                quantity: 1,
            },
        ],
        success_url: `${process.env.URL_BASE}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.URL_BASE}/api/stripe/cancel`,
        metadata: {
            userId: userId,
            type: type,
        }
    });

    await prisma.$transaction([
        prisma.invoice.create({
            data: {
                userId: userId,
                amount: amount,
                type: type as UtilityType,
                stripeSessionId: session.id,
                status: InvoiceStatus.PENDING,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        }),
        prisma.auditLog.create({
            data: {
                userId: userId,
                action: ActionType.PAYMENT_LINK_CREATED,
                details: `User created a payment link for ${description} with amount ${amount}`
            }
        })
    ]);

    return session;
}