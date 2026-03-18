import { validateSession, SESSION_COOKIE_NAME, SessionUser } from "@/lib/session/Session";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function validateAdminSession(
    req: NextRequest
): Promise<{ user: SessionUser } | { error: NextResponse }> {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const user = await validateSession(sessionToken);

    if (!user) {
        return { error: NextResponse.json({ error: "Invalid session" }, { status: 401 }) };
    }

    if (user.role !== Role.ADMIN) {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return { user };
}

export async function validateUserSession(
    req: NextRequest
): Promise<{ user: SessionUser } | { error: NextResponse }> {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const user = await validateSession(sessionToken);

    if (!user) {
        return { error: NextResponse.json({ error: "Invalid session" }, { status: 401 }) };
    }

    return { user };
}
