"use server";

import { sendEmail } from "@/lib/emailer/Mail";
import { generateHtmlOTP } from "@/lib/emailer/MailCreator";
import prisma from "@/lib/prisma";
import DoesEmailExist from "../../lib/users/DoesEmailExist";
import { validateEmail } from "../../lib/utils/Email";
import { generateCode, hashOTPCode } from "@/lib/utils/OTP";
import { ActionType } from "@prisma/client";
import { headers } from "next/headers";
import { enforceRateLimit } from "@/lib/utils/rateLimit";

const LOGIN_IP_LIMIT = {
    limit: 10,
    windowMs: 15 * 60 * 1000,
    blockMs: 30 * 60 * 1000,
};

const LOGIN_EMAIL_LIMIT = {
    limit: 5,
    windowMs: 15 * 60 * 1000,
    blockMs: 60 * 60 * 1000,
};


export default async function LoginAction(
    currentState: any,
    data: FormData
) {

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headersList.get("x-real-ip") ||
        "unknown";

    await enforceRateLimit(`login:ip:${ipAddress}`, LOGIN_IP_LIMIT);

    const email = data.get('email') as string;
    const emailLower = email.toLowerCase();

    if (!(await validateEmail(emailLower))) {
        return { error: "Invalid email" };
    }

    await enforceRateLimit(`login:email:${emailLower}`, LOGIN_EMAIL_LIMIT);

    const doesEmailExist = await DoesEmailExist(emailLower);

    if (!doesEmailExist) {
        return { error: "Email does not exist" };
    }

    const user = await prisma.user.findUnique({
        where: { email: emailLower },
        select: { id: true },
    });

    const code = await generateCode();

    await sendEmail(
        emailLower,
        "Her er din engangskode",
        generateHtmlOTP(code)
    );

    await prisma.auditLog.create({
        data: {
            userId: user!.id,
            action: ActionType.LOGIN_OTP_SENT,
            details: `Sent login OTP to ${emailLower}`,
        },
    });

    const hashedCode = await hashOTPCode(code);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationToken.upsert({
        where: { identifier: emailLower },
        update: { token: hashedCode, expires },
        create: { identifier: emailLower, token: hashedCode, userId: user!.id, expires },
    });

    return { success: true };
}