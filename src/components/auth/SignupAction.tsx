'use server';

import { redirect } from 'next/navigation';
import { validateEmail, validatePhone } from '../../lib/utils/Email';

export default async function SignupAction(
    currentState: any,
    data: FormData
) { 

    const fullName = data.get('fullName') as string;
    const email = data.get('email') as string;
    const phone = data.get('phone') as string;
    const turnstileToken = data.get('cf-turnstile-response') as string;

    console.log(fullName, email, phone, turnstileToken);

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

    if (!(await validatePhone(phone))) {
        return { error: "Invalid phone number" };
    }
    
    const res = await fetch(`${process.env.URL_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: fullName,
            email,
            phone
        }),
    })

    if (!res.ok) {
        const errorData = await res.json();
        return { error: errorData.error || "An error occurred" };
    }

    const user = await res.json();

    redirect('/login');

}