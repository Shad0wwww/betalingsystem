"use server";

import { validateEmail } from "@/lib/utils/Email";
import { cookies } from "next/headers";

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

    const res = await fetch(`${process.env.URL_BASE}/api/auth/otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            email: emailLower,
            code: codeUPPER
        }),
    });

    if (!res.ok) {

        const errorText = await res.text();

        const errorData = errorText ? JSON.parse(errorText) : null;

        return { error: errorData?.error || "An error occurred" };

    }

    const token = await res.json();

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token.token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 1, 
    });

    return { success: true };
}