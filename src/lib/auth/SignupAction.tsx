'use server';

export default async function SignupActio(
    currentState: any,
    data: FormData
) { 

    const fullName = data.get('fullName') as string;
    const email = data.get('email') as string;
    const phone = data.get('phone') as string;

    console.log(fullName, email, phone);
    //TODO: Add error handling and validation


    const res = await fetch(`${process.env.URL_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fullName,
            email,
            phone
        }),
    })

    const json = await res.json();
    console.log(json);

}