import { sendEmail } from "@/lib/emailer/Mail";
import { generateHtmlOTP } from "@/lib/emailer/MailCreator";
import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { generateCode, hashOTPCode } from "@/lib/utils/OTP";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const cookie = req.cookies.get("auth_token")?.value;

    const { newEmail } = await req.json();

    if (!newEmail || typeof newEmail !== "string") {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!cookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, email } = (await verifyJsonWebtoken(cookie)) as unknown as {
        userId: string;
        email: string;
    };

    if (!userId || !email) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
        },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }


    const {
            code, hashedCode
    } = await generateAndHashOTPCode()

    await sendEmail(email, "Her er din engangskode", generateHtmlOTP(code));
    await sendEmail(newEmail, "Her er din engangskode", generateHtmlOTP(code));

    await prisma.verificationToken.upsert({
        where: {
            identifier: email
        },
        create: {
            identifier: userId,
            token: hashedCode,
            expires: new Date(Date.now() + 10 * 60 * 1000),
            userId: userId,
        },
        update: {
            token: hashedCode
        }
    });

    await prisma.verificationToken.upsert({
        where: {
            identifier: newEmail
        },
        create: {
            identifier: userId,
            token: hashedCode,
            expires: new Date(Date.now() + 10 * 60 * 1000),
            userId: userId, 
        },
        update: {
            token: hashedCode
        }
    });


    return NextResponse.json({ message: "Email sended" }, { status: 200 });
}


async function generateAndHashOTPCode() {
    const code = await generateCode();
    const hashedCode = await hashOTPCode(code);
    return { code, hashedCode };
}