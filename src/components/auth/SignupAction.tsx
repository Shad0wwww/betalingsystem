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

    console.log(fullName, email, phone);

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