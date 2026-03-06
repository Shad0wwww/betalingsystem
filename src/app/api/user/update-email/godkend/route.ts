import { ActionType } from "@prisma/client";
import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import getStripe from "@/lib/stripe/Stripe";
import { verifyOTPCode } from "@/lib/utils/OTP";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const cookie = req.cookies.get("auth_token")?.value;
        const { oldCode, newCode, newEmail } = await req.json();

        if (!cookie) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!oldCode || !newCode || oldCode.length !== 6 || newCode.length !== 6) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const { userId, email } = (await verifyJsonWebtoken(cookie)) as unknown as {
            userId: string;
            email: string;
        };

        if (!userId || !email) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const [storedOldToken, storedNewToken] = await Promise.all([
            prisma.verificationToken.findUnique({
                where: { identifier: email },
                select: { token: true, expires: true }
            }),
            prisma.verificationToken.findUnique({
                where: { identifier: newEmail },
                select: { token: true, expires: true }
            })
        ]);

        if (!storedOldToken || !storedNewToken) {
            return NextResponse.json({ error: "OTP not found" }, { status: 400 });
        }
        if (isExpired(storedOldToken.expires) || isExpired(storedNewToken.expires)) {
            return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
        }

        const isOldCodeValid = verifyOTPCode(oldCode, storedOldToken.token);
        const isNewCodeValid = verifyOTPCode(newCode, storedNewToken.token);

        if (!isOldCodeValid || !isNewCodeValid) {
            return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
        }

        const customerId = await prisma.user.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true }
        }).then(user => user?.stripeCustomerId);

        
        await updateStripeCustomerEmail(customerId!, newEmail);

        await prisma.user.update({
            where: { id: userId },
            data: { email: newEmail }
        });

        await prisma.verificationToken.deleteMany({
            where: {
                identifier: { in: [email, newEmail] }
            }
        });

        await prisma.auditLog.create({
            data: {
                userId: userId,
                action: ActionType.EMAIL_CHANGE,
                details: `User changed email from ${email} to ${newEmail}`
            }
        });

        return NextResponse.json({ message: "Email successfully updated" }, { status: 200 });

    } catch (err) {
        console.error("Error during email change approval:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function isExpired(expires: Date): boolean {
    return new Date() > expires;
}

async function updateStripeCustomerEmail(
    custumerId: string, newEmail: string
) {

    await getStripe().customers.update(custumerId, {
        email: newEmail,
    }).catch(err => {
        console.error("Error updating Stripe customer email:", err);
    });
}