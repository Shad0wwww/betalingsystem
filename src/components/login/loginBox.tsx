'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import LoginAction from '@/components/auth/LoginAction'; 
import VerifyOtpAction from '@/components/auth/VerifyOtpAction'; 
import { redirect } from 'next/navigation';

const LoginBox: React.FC = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [email, setEmail] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Trin 1: Tjek email og send OTP
    const [error1, formAction1, isPending1] = useActionState(
        async (prevState: any, formData: FormData) => {
            const result = await LoginAction(prevState, formData);
            if (result?.success) {
                setEmail(formData.get('email') as string);
                setIsOtpSent(true);
            }
            return result?.error || null; 
        },
        null
    );

    // Trin 2: Verificer OTP og log ind
    const [error2, formAction2, isPending2] = useActionState(
        async (prevState: any, formData: FormData) => {
            const result = await VerifyOtpAction(prevState, formData);
            if (result?.success) {
                // Her kan du redirecte til dashboard eller hjemmeside
                redirect('/dashboard'); 
            }
            return null;
        },
        null
    );

    if (!isMounted) {
        return null;
    }

    if (isOtpSent) {
        return (
            <div>
                <div className="border rounded-lg custom-box2 py-10 px-12">
                    <h1 className="text-[#ffff] font-bold text-[25px] text-center mb-6">
                        Indtast engangskode
                    </h1>
                    <p className="text-gray-400 text-center text-[15px] mb-8">
                        Vi har sendt en 6-cifret kode til <strong>{email}</strong>
                    </p>

                    <form action={formAction2} suppressHydrationWarning>
                        <input type="hidden" name="email" value={email} />

                        <div className="mb-4">
                            <p className="text-[#ffff] font-normal text-[15px] mb-2">Engangskode</p>
                            <input
                                name="otp"
                                type="text"
                                placeholder="123456"
                                maxLength={6}
                                className="w-full border rounded-md p-2 border-[#292828] bg-[#131313] text-white text-center text-2xl tracking-widest"
                                required
                                autoComplete="one-time-code"
                                autoFocus
                                suppressHydrationWarning
                                data-1p-ignore="true"
                                data-lpignore="true"
                            />
                        </div>

                        {error2 && <p className="text-red-500 text-sm mb-4 text-center">{error2}</p>}

                        <button
                            type="submit"
                            disabled={isPending2}
                            className="w-full py-2 font-medium bg-white text-black rounded-md mt-3 disabled:opacity-70"
                        >
                            {isPending2 ? 'Logger ind...' : 'Log ind'}
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="text-gray-400 text-sm mt-4 underline block mx-auto"
                    >
                        Tilbage til email
                    </button>
                </div>
            </div>
        );
    }

    // Trin 1: Email-input (kan tilføje telefon hvis nødvendigt)
    return (
        <div>
            <div className="border rounded-lg custom-box2 py-10 px-12">
                <div className="flex justify-center">
                    <h1 className="text-[#ffff] font-bold text-[25px] leading-none mb-2">
                        Log ind
                    </h1>
                </div>

                <form action={formAction1} autoComplete="off" suppressHydrationWarning>
                    <div className="flex justify-center">
                        <p className="text-gray-400 pb-2 text-[15px]">
                            Indtast din email for at modtage en engangskode
                        </p>
                    </div>

                    <div className="mb-4 pt-2">
                        <p className="text-[#ffff] font-normal text-[15px] leading-none mb-2">Email</p>
                        <input
                            name="email"
                            type="email"
                            placeholder="example@gmail.com"
                            className="w-full border rounded-md p-2 border-[#292828] bg-[#131313] text-white"
                            required
                            autoComplete="off"
                            autoFocus
                            suppressHydrationWarning
                            data-1p-ignore="true"
                            data-lpignore="true"
                        />
                    </div>

                    {/* Hvis du også vil bruge telefon som alternativ:
                    <div className="mb-4">
                        <p className="text-[#ffff] font-normal text-[15px] leading-none mb-2">Eller telefonnummer</p>
                        <input
                        name="phone"
                        type="tel"
                        placeholder="+45 12345678"
                        className="w-full border rounded-md p-2 border-[#292828] bg-[#131313] text-white"
                        />
                    </div> */}

                    {error1 && <p className="text-red-500 text-sm mb-4 text-center">{error1}</p>}

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={isPending1}
                            className="w-full text-sm py-2 font-medium bg-white text-black rounded-md mt-3 disabled:opacity-70"
                        >
                            {isPending1 ? 'Sender kode...' : 'Send engangskode'}
                        </button>
                    </div>

                    <div className="flex justify-center mt-4">
                        <p className="text-gray-400 text-[15px]">
                            Har du ikke en konto?{' '}
                            <Link href="/signup" className="text-white underline">
                                Opret konto
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginBox;