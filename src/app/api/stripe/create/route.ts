import { NextRequest, NextResponse } from "next/server";
import { InvoiceService } from "@/lib/services/invoiceService";
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

        const paymentLink = await InvoiceService.createInvoiceWithPayment(
            userId,
            body.amount,
            body.type,
            body.description
        );



        return NextResponse.json({ url: paymentLink.url });



    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create payment link." },
            { status: 500 }
        );
    }
}

