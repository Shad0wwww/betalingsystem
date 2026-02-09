"use server";

import DoesEmailExist from "../../lib/users/DoesEmailExist";
import { validateEmail } from "../../lib/utils/Email";


export default async function LoginAction(
    currentState: any,
    data: FormData
) {

    const email = data.get('email') as string;

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