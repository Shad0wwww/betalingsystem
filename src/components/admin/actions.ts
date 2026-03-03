"use server";

import { cookies } from "next/headers";

export async function get(apiPath: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    const res = await fetch(`${process.env.URL_BASE}/${apiPath}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error(`API fejl: ${res.status} ${res.statusText}`);
    return res.json();
}
