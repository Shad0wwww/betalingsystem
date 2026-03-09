"use server";

import { verifyJsonWebtoken } from "@/lib/jwt/Jwt";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/emailer/Mail";
import { generateHtmlOTP } from "@/lib/emailer/MailCreator";
import { generateCode, hashOTPCode, verifyOTPCode } from "@/lib/utils/OTP";
import DoesEmailExist from "@/lib/users/DoesEmailExist";
import getStripe from "@/lib/stripe/Stripe";
import { ActionType } from "@prisma/client";
import { cookies } from "next/headers";

async function getAuthPayload(): Promise<{ userId: string; email: string }> {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) throw new Error("Unauthorized");
    const payload = await verifyJsonWebtoken(token);
    if (!payload || typeof payload === "string") throw new Error("Invalid token");
    const userId = (payload as any).userId || (payload as any).id;
    const email = (payload as any).email;
    if (!userId || !email) throw new Error("Unauthorized");
    return { userId, email };
}

export async function updateName(name: string) {
    if (!name || typeof name !== "string") throw new Error("Invalid name");
    const { userId } = await getAuthPayload();

    await prisma.user.update({ where: { id: userId }, data: { name } });
    await prisma.auditLog.create({
        data: {
            userId,
            action: ActionType.NAME_CHANGE,
            details: `User changed name to ${name}`,
        },
    });
    return { message: "Name updated successfully!" };
}

export async function sendEmailChangeOtp(newEmail: string) {
    if (!newEmail || typeof newEmail !== "string") throw new Error("Invalid email");
    if (await DoesEmailExist(newEmail)) throw new Error("Email already in use");

    const { userId, email } = await getAuthPayload();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
    });
    if (!user) throw new Error("User not found");

    const oldCode = await generateCode();
    const newCode = await generateCode();
    const oldHashedCode = await hashOTPCode(oldCode);
    const newHashedCode = await hashOTPCode(newCode);

    await prisma.verificationToken.upsert({
        where: { identifier: email },
        create: { identifier: email, token: oldHashedCode, expires: new Date(Date.now() + 10 * 60 * 1000), userId },
        update: { token: oldHashedCode, expires: new Date(Date.now() + 10 * 60 * 1000) },
    });

    await prisma.verificationToken.upsert({
        where: { identifier: newEmail },
        create: { identifier: newEmail, token: newHashedCode, expires: new Date(Date.now() + 10 * 60 * 1000), userId },
        update: { token: newHashedCode, expires: new Date(Date.now() + 10 * 60 * 1000) },
    });

    await prisma.auditLog.create({
        data: {
            userId,
            action: ActionType.EMAIL_CHANGE,
            details: `User requested email change from ${email} to ${newEmail}`,
        },
    });

    await sendEmail(email, "Du er i gang med at ændre din email adresse, godkend ved at skrive koden", generateHtmlOTP(oldCode));
    await sendEmail(newEmail, "Godkend din nye email adresse - ved at skrive koden", generateHtmlOTP(newCode));

    return { message: "Email sended" };
}

export async function confirmEmailChange(oldCode: string, newCode: string, newEmail: string) {
    if (!oldCode || !newCode || oldCode.length !== 6 || newCode.length !== 6) throw new Error("Invalid request");

    const { userId, email } = await getAuthPayload();

    const [storedOldToken, storedNewToken] = await Promise.all([
        prisma.verificationToken.findUnique({ where: { identifier: email }, select: { token: true, expires: true } }),
        prisma.verificationToken.findUnique({ where: { identifier: newEmail }, select: { token: true, expires: true } }),
    ]);

    if (!storedOldToken || !storedNewToken) throw new Error("OTP not found");
    if (new Date() > storedOldToken.expires || new Date() > storedNewToken.expires) throw new Error("OTP has expired");

    const isOldValid = await verifyOTPCode(oldCode, storedOldToken.token);
    const isNewValid = await verifyOTPCode(newCode, storedNewToken.token);
    if (!isOldValid || !isNewValid) throw new Error("Invalid OTP code");

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
    if (user?.stripeCustomerId) {
        await getStripe().customers.update(user.stripeCustomerId, { email: newEmail }).catch(() => {});
    }

    await prisma.user.update({ where: { id: userId }, data: { email: newEmail } });

    await prisma.verificationToken.deleteMany({ where: { identifier: { in: [email, newEmail] } } });

    await prisma.auditLog.create({
        data: {
            userId,
            action: ActionType.EMAIL_CHANGE,
            details: `User changed email from ${email} to ${newEmail}`,
        },
    });

    return { message: "Email successfully updated" };
}
