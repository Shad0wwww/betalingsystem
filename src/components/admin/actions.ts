"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/session/Session";

export async function get(apiPath: string) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const res = await fetch(`${process.env.URL_BASE}/${apiPath}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
        },
    });
    if (!res.ok) throw new Error(`API fejl: ${res.status} ${res.statusText}`);
    return res.json();
}
