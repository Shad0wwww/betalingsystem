"use server";

import { sendEmail } from "@/lib/emailer/Mail";
import { generateHtmlOTP } from "@/lib/emailer/MailCreator";
import prisma from "@/lib/prisma";
import DoesEmailExist from "../../lib/users/DoesEmailExist";
import { validateEmail } from "../../lib/utils/Email";
import { generateCode, hashOTPCode } from "@/lib/utils/OTP";
import { ActionType } from "@prisma/client";


export default async function LoginAction(
    currentState: any,
    data: FormData
) {

    const email = data.get('email') as string;
    const emailLower = email.toLowerCase();

    if (!(await validateEmail(emailLower))) {
        return { error: "Invalid email" };
    }

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