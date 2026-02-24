import 'server-only';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import { $Enums, InvoiceStatus, UtilityType } from "@prisma/client";

import getStripe from '@/lib/stripe/Stripe';
import prisma from '@/lib/prisma';
import { GetUser } from '@/lib/users/GetUser';

type CreatePaymentLinkBody = {
    amount: number;
    description: string;
    type: $Enums.UtilityType;
};

export async function POST(
    request: NextRequest
) {
    try {
        const body = (await request.json()) as CreatePaymentLinkBody;


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
            userId: number;
            email: string;
        };

        const customerId = await GetUser.getCustomerIDByEmail(email);

        console.log("Creating Stripe session for user:", email, "with customer ID:", customerId);

        const session = await getStripe().checkout.sessions.create({
            customer: customerId!,
            payment_method_types: ["card"],
            
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
            mode: "payment",
            success_url: `${process.env.URL_BASE}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.URL_BASE}/api/stripe/cancel`,
            metadata: {
                userId: userId.toString(),
                type: body.type,
            }
        });

        console.log("Stripe session created:", session);


        await prisma.invoice.create({
            data: {
                userId: parseInt(userId.toString()),
                amount: body.amount, 
                type: body.type as UtilityType,
                stripePaymentIntentId: session.id, 
                status: InvoiceStatus.PENDING,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
            },
        });

        return NextResponse.json({ url: session.url });



    } catch (error) {
        console.error("Error creating payment link:", error);
        return NextResponse.json(
            { error: "Failed to create payment link." },
            { status: 500 }
        );
    }
}


