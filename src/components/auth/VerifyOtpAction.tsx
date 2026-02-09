"use server";

import { validateEmail } from "@/lib/utils/Email";

export default async function VerifyOtpAction(
    currentState: any,
    data: FormData
) {
    const email = data.get('email') as string;
    const code = data.get('otp') as string;

    if (!(await validateEmail(email))) {
        return { error: "Invalid email" };
    }

    const res = await fetch(`${process.env.URL_BASE}/api/auth/otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            code
        }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        return { error: errorData.error || "An error occurred" };
    }
    
    return { success: true };
}