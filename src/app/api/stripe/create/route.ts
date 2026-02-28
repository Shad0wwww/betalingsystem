import 'server-only';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import { $Enums, ActionType, InvoiceStatus, UtilityType } from "@prisma/client";

import getStripe from '@/lib/stripe/Stripe';
import prisma from '@/lib/prisma';
import { GetUser } from '@/lib/users/GetUser';
import { createStripeCustomer } from '@/lib/stripe/CreateCustomer';

type CreatePaymentLinkBody = {
    amount: number;
    description: string;
    type: $Enums.UtilityType;
};

export async function POST(
    request: NextRequest
) {
    try {
        const body = await request.json() as CreatePaymentLinkBody;

        console.log("Received payment link creation request with body:", body);

        const URL_BASE = process.env.URL_BASE || "https://web.pins.dk/da-DK";

        if (!body?.amount || !body?.description || body?.type === undefined) {
            return NextResponse.json(
                { error: "amount, description, and type are required." },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const authToken = cookieStore.get("auth_token");

        if (!authToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const verifyJWTToken = await verifyJsonWebtoken(authToken.value);

        if (!verifyJWTToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const {
            userId,
            email
        } = verifyJWTToken as unknown as {
            userId: string;
            email: string;
        };

        const user = await GetUser.byEmail(email);

        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
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
                        unit_amount: body.amount,
                        product_data: {
                            name: body.description,
                        },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.URL_BASE}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.URL_BASE}/api/stripe/cancel`,
            metadata: {
                userId: userId,
                type: body.type,
            }
        });


        await prisma.invoice.create({
            data: {
                userId: userId,
                amount: body.amount,
                type: body.type as UtilityType,
                stripeSessionId: session.id, 
                status: InvoiceStatus.PENDING,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        await prisma.auditLog.create({
            data: {
                userId: userId,
                action: ActionType.PAYMENT_LINK_CREATED,
                details: `User created a payment link for ${body.description} with amount ${body.amount}`
            }
        });

        return NextResponse.json({ url: session.url });



    } catch (error) {

        return NextResponse.json(
            { error: "Failed to create payment link." },
            { status: 500 }
        );
    }
}


