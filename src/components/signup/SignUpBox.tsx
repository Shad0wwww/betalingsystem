'use client';

import React, { useEffect, useState } from 'react'; // 1. Tilføj useEffect/useState
import Link from 'next/link';
import { useActionState } from 'react';
import SignupAction from '@/components/auth/SignupAction';
import { Turnstile } from '@marsidev/react-turnstile';
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'


const FormContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="border rounded-lg custom-box2 py-10 px-12 border-[#292828] bg-[#131313]">
        {children}
    </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-4">
        <label className="block text-white font-normal text-[15px] leading-none mb-2">
            {label}
        </label>
        {children}
    </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        suppressHydrationWarning
        className="w-full border rounded-md p-2 border-[#292828] bg-[#131313] text-white focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all"
    />
);

const SignUpBox: React.FC = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [state, formAction, isPending] = useActionState(SignupAction, undefined);
    const [validatePhone, setPhone] = useState<string | null>(null);

    const env = process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const errorMessage = typeof state === 'string' ? state : state?.error;

    if (!isMounted) return null;

    return (
        <div className="w-full max-w-md mx-auto">
            <FormContainer>
                <div className="text-center mb-8">
                    <h1 className="text-white font-bold text-2xl mb-2">Create an account</h1>
                    <p className="text-gray-400 text-[15px]">
                        Enter your details below to create your account
                    </p>
                </div>

                <form action={formAction} autoComplete="off">
                    <Field label="Full Name">
                        <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="John Doe"
                            required
                        />
                    </Field>

                    <Field label="Email">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="example@gmail.com"
                            required
                        />
                    </Field>

                    <Field label="Phone Number">
                        <PhoneInput
                            id="phone"
                            name="phone"
                            defaultCountry="DK"
                            placeholder="12345678"
                            value={validatePhone ?? ''}
                            onChange={(value) => setPhone(value || null)}
                            className="flex w-full border rounded-md p-2 border-[#292828] bg-[#131313] text-white focus-within:ring-1 focus-within:ring-gray-500 transition-all"
                        />
                    </Field>

                    {/* <div className="mb-4 flex justify-center">
                        <Turnstile
                            siteKey={env ?? ''}
                            options={{ theme: 'dark' }}
                        />
                    </div> */}

                    {errorMessage && (
                        <p className="text-red-500 text-sm mb-4 text-center">
                            {errorMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 font-medium bg-white text-black rounded-md mt-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {isPending ? 'Creating account...' : 'Create Account'}
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-white underline hover:text-gray-300">
                                Login
                            </Link>
                        </p>
                    </div>
                </form>
            </FormContainer>
        </div>
    );
};

export default SignUpBox;