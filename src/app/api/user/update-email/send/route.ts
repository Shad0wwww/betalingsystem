import { sendEmail } from "@/lib/emailer/Mail";
import { generateHtmlOTP } from "@/lib/emailer/MailCreator";
import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import DoesEmailExist from "@/lib/users/DoesEmailExist";
import { generateCode, hashOTPCode } from "@/lib/utils/OTP";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const cookie = req.cookies.get("auth_token")?.value;

    const { newEmail } = await req.json();

    if (!newEmail || typeof newEmail !== "string") {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (await DoesEmailExist(newEmail)) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
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


    const { code: oldCode, hashedCode: oldHashedCode } = await generateAndHashOTPCode();
    const { code: newCode, hashedCode: newHashedCode } = await generateAndHashOTPCode();


    await prisma.verificationToken.upsert({
        where: {
            identifier: email
        },
        create: {
            identifier: email,
            token: oldHashedCode,
            expires: new Date(Date.now() + 10 * 60 * 1000),
            userId: userId,
        },
        update: {
            token: oldHashedCode
        }
    });

    await prisma.verificationToken.upsert({
        where: {
            identifier: newEmail
        },
        create: {
            identifier: newEmail,
            token: newHashedCode,
            expires: new Date(Date.now() + 10 * 60 * 1000),
            userId: userId, 
        },
        update: {
            token: newHashedCode
        }
    });

    await sendEmail(email, "Ændring af email", generateHtmlOTP(oldCode));
    await sendEmail(newEmail, "Ny email adresse", generateHtmlOTP(newCode));


    return NextResponse.json({ message: "Email sended" }, { status: 200 });
}


async function generateAndHashOTPCode() {
    const code = await generateCode();
    const hashedCode = await hashOTPCode(code);
    return { code, hashedCode };
}