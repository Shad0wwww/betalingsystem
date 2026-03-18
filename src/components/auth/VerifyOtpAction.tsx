"use server";

import { createSession, setSessionCookie } from "@/lib/session/Session";
import prisma from "@/lib/prisma";
import { validateEmail } from "@/lib/utils/Email";
import { verifyOTPCode } from "@/lib/utils/OTP";
import { ActionType } from "@prisma/client";
import { headers } from "next/headers";

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

    if (!user) {
        return { error: "User not found" };
    }

    // Hent user agent og IP til session tracking
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || undefined;
    const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0] ||
                      headersList.get("x-real-ip") ||
                      undefined;

    // Opret database session
    const sessionToken = await createSession(user.id, userAgent, ipAddress);

    await prisma.verificationToken.deleteMany({
        where: { identifier: emailLower },
    });

    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: ActionType.LOGIN,
            details: `User logged in with OTP`,
        },
    });

    // Sæt session cookie
    await setSessionCookie(sessionToken);

    return { success: true };
}

function isExpired(expires: Date): boolean {
    const tenMinutes = 10 * 60 * 1000;
    const now = new Date().getTime();
    return (now - expires.getTime()) > tenMinutes;
}