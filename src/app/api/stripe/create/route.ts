import { NextResponse } from "next/server";
import { createPaymentLink } from "@/lib/stripe/CreatePaymentLink";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";

enum UtilityType {
    WATER,  
    ELECTRICITY
}

type CreatePaymentLinkBody = {
    amount: number;
    description: string;
    type: UtilityType;
};

export async function POST(request: Request) {
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

        const verifyJWTToken = verifyJsonWebtoken(authToken.value);

        if (!verifyJWTToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = (verifyJWTToken as any).userId;

        const invoice = await prisma.invoice.create({
            data: {
                amount: body.amount,
                userId: userId,
                currency: "dkk",
                status: "PENDING",
                type: body.type === UtilityType.WATER ? "WATER" : "ELECTRICITY",

                dueDate: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                ),
            },
        });


        const paymentLink = await createPaymentLink({
            amount: body.amount,
            description: body.description,
            metadata: {
                userId: userId,
                invoiceId: invoice.id,
            },
        });

        await prisma.invoice.update({
            where: {
                id: invoice.id,
            },
            data: {
                stripePaymentIntentId: paymentLink.id,
            },
        });


        return NextResponse.json({ url: paymentLink.url });



    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create payment link." },
            { status: 500 }
        );
    }
}

