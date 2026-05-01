"use server";

import { getCurrentUser, getUserSessions, SESSION_COOKIE_NAME } from "@/lib/session/Session";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/emailer/Mail";
import { generateHtmlOTP } from "@/lib/emailer/MailCreator";
import { generateCode, hashOTPCode, verifyOTPCode } from "@/lib/utils/OTP";
import DoesEmailExist from "@/lib/users/DoesEmailExist";
import getStripe from "@/lib/stripe/Stripe";
import { ActionType } from "@prisma/client";
import { cookies } from "next/headers";
import { log } from "console";
import { cacheLife } from "next/dist/server/use-cache/cache-life";

async function getAuthPayload(): Promise<{ userId: string; email: string }> {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    return { userId: user.userId, email: user.email };
}

export async function updateName(name: string) {
    if (!name || typeof name !== "string") throw new Error("Invalid name");
    const { userId } = await getAuthPayload();

    await prisma.user.update({ where: { id: userId }, data: { name } });

    await log(ActionType.NAME_CHANGE, userId, `User changed name to ${name}`);

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


    log(ActionType.EMAIL_CHANGE, userId, `User requested email change from ${email} to ${newEmail}`);

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

    log(ActionType.EMAIL_CHANGE, userId, `User confirmed email change from ${email} to ${newEmail}`);

    return { message: "Email successfully updated" };
}


export interface SessionInfo {
    id: string;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: Date;
    isCurrentSession: boolean;
}

function parseUserAgent(ua: string | null): string {
    if (!ua) return "Unknown";

    // Detect browser
    let browser = "Unknown Browser";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg/")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

    // Detect OS
    let os = "Unknown OS";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    return `${browser} on ${os}`;
}

export async function getMySessions(): Promise<SessionInfo[]> {
    const { userId } = await getAuthPayload();

    const cookieStore = await cookies();
    const currentSessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const sessions = await getUserSessions(userId);

    // Hent også current session token for at markere den

    'use cache';
    cacheLife("minutes");

    const currentSession = currentSessionToken
        ? await prisma.session.findUnique({
              where: { sessionToken: currentSessionToken },
              select: { id: true },
          })
        : null;

    return sessions.map((session) => ({
        id: session.id,
        userAgent: parseUserAgent(session.userAgent),
        ipAddress: session.ipAddress,
        createdAt: session.createdAt,
        isCurrentSession: currentSession?.id === session.id,
    }));
}

export async function logoutSession(sessionId: string) {
    const { userId } = await getAuthPayload();

    const cookieStore = await cookies();
    const currentSessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const session = await prisma.session.findFirst({
        where: { id: sessionId, userId },
    });

    if (!session) throw new Error("Session not found");

    if (currentSessionToken) {
        const currentSession = await prisma.session.findUnique({
            where: { sessionToken: currentSessionToken },
        });
        if (currentSession?.id === sessionId) {
            throw new Error("Cannot logout current session");
        }
    }

    await prisma.session.delete({ where: { id: sessionId } });

    return { success: true };
}

export async function logoutAllOtherSessions() {
    const { userId } = await getAuthPayload();

    const cookieStore = await cookies();
    const currentSessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // Slet alle sessions undtagen den nuværende
    await prisma.session.deleteMany({
        where: {
            userId,
            sessionToken: { not: currentSessionToken ?? "" },
        },
    });



    await log(ActionType.LOGOUT_ALL_DEVICES, userId, "User logged out of all other devices");

    return { success: true };
}

// ─── Account Deletion ───────────────────────────────────────────────────────

export async function deleteAccount() {
    const { userId } = await getAuthPayload();


    await log(ActionType.ACCOUNT_DELETED, userId, "User deleted their account");


    await prisma.session.deleteMany({
        where: { userId },
    });

    await prisma.user.delete({
        where: { id: userId },
    });

    // Clear the auth cookie
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return { success: true };
}

