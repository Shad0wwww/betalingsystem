"use server";

import { generateJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { validateEmail } from "@/lib/utils/Email";
import { verifyOTPCode } from "@/lib/utils/OTP";
import { ActionType } from "@prisma/client";
import { cookies } from "next/headers";

export default async function VerifyOtpAction(
    currentState: any,
    data: FormData
) {
    const email = data.get('email') as string;
    const code = data.get('otp') as string;

    const emailLower = email.toLowerCase();
    const codeUPPER = code.toUpperCase();

    if (!(await validateEmail(emailLower))) {
        return { error: "Invalid email" };
    }

    if (!code || code.length !== 6) {
        return { error: "Invalid code" };
    }

    const storedToken = await prisma.verificationToken.findUnique({
        where: { identifier: emailLower },
        select: { token: true, expires: true },
    });

    if (!storedToken) {
        return { error: "No OTP found for this email" };
    }

    if (isExpired(storedToken.expires)) {
        return { error: "OTP code has expired" };
    }

    const isValid = await verifyOTPCode(codeUPPER, storedToken.token);

    if (!isValid) {
        return { error: "Invalid OTP code" };
    }

    const user = await prisma.user.findUnique({
        where: { email: emailLower },
        select: { id: true, role: true },
    });

    const token = await generateJsonWebtoken(
        user!.id.toString(),
        emailLower,
        user!.role
    );

    await prisma.verificationToken.deleteMany({
        where: { identifier: emailLower },
    });

    await prisma.auditLog.create({
        data: {
            userId: user!.id,
            action: ActionType.LOGIN_OTP_SENT_SUCCESS,
            details: `User logged in with OTP`,
        },
    });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 1,
    });

    return { success: true };
}

function isExpired(expires: Date): boolean {
    const tenMinutes = 10 * 60 * 1000;
    const now = new Date().getTime();
    return (now - expires.getTime()) > tenMinutes;
}