"use server";

import DoesEmailExist from "../../lib/users/DoesEmailExist";
import { validateEmail } from "../../lib/utils/Email";


export default async function LoginAction(
    currentState: any,
    data: FormData
) {

    const email = data.get('email') as string;
    const turnstileToken = data.get('cf-turnstile-response') as string;

    console.log(email, turnstileToken);

    if (!turnstileToken) {
        return { error: "Sikkerhedstjek mangler. Prøv igen." };
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            secret: process.env.CLOUDFLARE_SECRET_KEY ?? '', 
            response: turnstileToken,
        }),
    });

    const verification = await verifyRes.json();

    if (!verification.success) {
        return { error: "Sikkerhedstjek fejlede. Venligst bekræft at du ikke er en robot." };
    }

    if (!(await validateEmail(email))) {
        return { error: "Invalid email" };
    }

    const doesEmailExist = await DoesEmailExist(email);

    if (!doesEmailExist) {
        return { error: "Email does not exist" };
    }

    await fetch(`${process.env.URL_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },        
        body: JSON.stringify({
            email,
        }),
    })


    return { success: true };
}