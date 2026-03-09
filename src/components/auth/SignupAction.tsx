'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import DoesEmailExist from '@/lib/users/DoesEmailExist';
import { validatePhone } from '@/lib/users/Phone';
import { validateEmail } from '../../lib/utils/Email';
import { createStripeCustomer } from '@/lib/stripe/CreateCustomer';

export default async function SignupAction(
    currentState: any,
    data: FormData
) { 

    const fullName = data.get('fullName') as string;
    const email = data.get('email') as string;
    const phone = data.get('phone') as string;
    const phoneCountry = data.get('phoneCountry') as string;

    const emailLower = email.toLowerCase();

    if (!fullName || !emailLower) {
        return { error: "Name and email are required" };
    }

    if (!(await validateEmail(emailLower))) {
        return { error: "Invalid email" };
    }

    const doesEmailExist = await DoesEmailExist(emailLower);
    if (doesEmailExist) {
        return { error: "Email already exists" };
    }

    const doesPhoneExist = await validatePhone(phone, phoneCountry);
    if (doesPhoneExist) {
        return { error: "Phone already exists" };
    }

    const customer = await createStripeCustomer(emailLower, fullName, phone);

    await prisma.user.create({
        data: {
            name: fullName,
            email: emailLower,
            phone,
            phoneCountry,
            stripeCustomerId: customer.id,
        },
    });

    redirect('/login?email=' + encodeURIComponent(emailLower));

}