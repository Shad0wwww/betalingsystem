import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "session_token";
const SESSION_EXPIRY_DAYS = 30;

export interface SessionUser {
    userId: string;
    email: string;
    role: Role;
}

/**
 * Genererer et kryptografisk sikkert session token
 */
export function generateSessionToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Opretter en ny session i databasen
 */
export async function createSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string
): Promise<string> {
    const sessionToken = generateSessionToken();
    const expires = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await prisma.session.create({
        data: {
            sessionToken,
            userId,
            expires,
            userAgent,
            ipAddress,
        },
    });

    return sessionToken;
}

/**
 * Validerer en session og returnerer brugerdata
 */
export async function validateSession(
    sessionToken: string
): Promise<SessionUser | null> {
    const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    if (!session) {
        return null;
    }

    // Tjek om session er udløbet
    if (new Date() > session.expires) {
        await prisma.session.delete({ where: { id: session.id } });
        return null;
    }

    return {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
    };
}

/**
 * Henter den nuværende bruger fra session cookie
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
        return null;
    }

    return validateSession(sessionToken);
}

/**
 * Tjekker om der er en gyldig session (til middleware)
 */
export async function checkAuthentication(sessionToken: string): Promise<boolean> {
    const user = await validateSession(sessionToken);
    return user !== null;
}

/**
 * Sletter en specifik session
 */
export async function deleteSession(sessionToken: string): Promise<void> {
    await prisma.session.deleteMany({
        where: { sessionToken },
    });
}

/**
 * Sletter alle sessions for en bruger (logout fra alle devices)
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
    await prisma.session.deleteMany({
        where: { userId },
    });
}

/**
 * Henter alle aktive sessions for en bruger
 */
export async function getUserSessions(userId: string) {
    return prisma.session.findMany({
        where: {
            userId,
            expires: { gt: new Date() },
        },
        select: {
            id: true,
            userAgent: true,
            ipAddress: true,
            createdAt: true,
            expires: true,
        },
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Sletter udløbne sessions (til cleanup cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.session.deleteMany({
        where: {
            expires: { lt: new Date() },
        },
    });
    return result.count;
}

/**
 * Sætter session cookie
 */
export async function setSessionCookie(sessionToken: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
        path: "/",
    });
}

/**
 * Sletter session cookie
 */
export async function clearSessionCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

export { SESSION_COOKIE_NAME };
