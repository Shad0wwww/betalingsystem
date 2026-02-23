import 'server-only';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import { $Enums } from "@prisma/client";

import getStripe from '@/lib/stripe/Stripe';

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

        const userId = (verifyJWTToken as any).userId;

        /* const paymentIntent = await getStripe().paymentIntents.create({
            amount: body.amount,
            currency: "dkk",
            description: body.description,
            metadata: {
                userId: userId,
                type: body.type,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret }); */

        return NextResponse.json({ message: "Payment link creation is currently disabled." });


    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create payment link." },
            { status: 500 }
        );
    }
}


