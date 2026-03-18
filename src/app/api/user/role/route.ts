import { validateSession, SESSION_COOKIE_NAME } from "@/lib/session/Session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await validateSession(sessionToken);

    if (!user) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({ role: user.role });
}
