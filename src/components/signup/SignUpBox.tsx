'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import SignupAction from '@/components/auth/SignupAction';
import { Turnstile } from '@marsidev/react-turnstile';
import { Anchor } from 'lucide-react';
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'


const FormContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="relative border rounded-2xl custom-box2 py-8 px-5 sm:py-10 sm:px-12 border-white/[0.08] bg-[#0c0c0f] overflow-hidden shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
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
        className="w-full border rounded-md p-3 sm:p-2 border-white/[0.08] bg-[#08080c] text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all"
    />
);



const SignUpBox: React.FC<{ dict: any }> = ({ dict }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [state, formAction, isPending] = useActionState(SignupAction, undefined);

    const [email, setEmail] = useState(() => {
        const storedEmail = localStorage.getItem('signupEmail');
        return storedEmail ? JSON.parse(storedEmail) : '';
    });

    const [name, setName] = useState(() => {
        const storedName = localStorage.getItem('signupName');
        return storedName ? JSON.parse(storedName) : '';
    });

    const [phone, setPhoneState] = useState(() => {
        const storedPhone = localStorage.getItem('signupPhone');
        return storedPhone ? JSON.parse(storedPhone) : '';
    });

    useEffect(() => {
        try {
            setIsMounted(true);
        localStorage.setItem('signupEmail', JSON.stringify(email));
        localStorage.setItem('signupName', JSON.stringify(name));
        localStorage.setItem('signupPhone', JSON.stringify(phone));
        } catch (error) {
            console.error('Error accessing localStorage:', error);
        }
        
    }, [email, name, phone]);

    function handelEmailChange(value: string | undefined) {
        setEmail(value || null);
    }

    function handelNameChange(value: string | undefined) {
        setName(value || null);
    }

    function handelPhoneChange(value: string | undefined) {
        setPhoneState(value || null);
    }

    const errorMessage = typeof state === 'string' ? state : state?.error;

    if (!isMounted) return null;

    return (
        <div className="w-full max-w-md mx-auto px-4 sm:px-0">
            <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2 border border-white/[0.08] rounded-full px-4 py-1.5 bg-white/5 backdrop-blur-sm">
                    <Anchor className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-white/60 text-xs font-medium tracking-wide">Ribe Sejlklub</span>
                </div>
            </div>
            <FormContainer>
                <div className="text-center mb-8">
                    <h1 className="text-white font-bold text-2xl mb-2">{dict.signup.title}</h1>
                    <p className="text-gray-400 text-[15px]">
                        {dict.signup.subtitle}
                    </p>
                </div>

                <form action={formAction} autoComplete="off">
                    <Field label={dict.signup.fullNameLabel}>
                        <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder={dict.signup.fullNamePlaceholder}
                            min={2}
                            onChange={(e) => handelNameChange(e.target.value)}
                            value={name}
                            required
                        />
                    </Field>

                    <Field label={dict.signup.emailLabel}>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={dict.signup.emailPlaceholder}
                            required
                            onChange={(e) => handelEmailChange(e.target.value)}
                            value={email}
                        />
                    </Field>

                    <Field label={dict.signup.phoneLabel}>
                        <PhoneInput
                            id="phone"
                            name="phone"
                            defaultCountry="DK"
                            placeholder={dict.signup.phonePlaceholder}
                            value={phone}
                            onChange={(value) => handelPhoneChange(value)}
                            required
                            className="flex w-full border rounded-md p-3 sm:p-2 border-white/[0.08] bg-[#08080c] text-white focus-within:ring-1 focus-within:ring-blue-500/50 transition-all"
                        />
                    </Field>

                    <Field label={dict.signup.tosLabel}>
                        <div className="flex items-center gap-2">
                            <input
                                id="tos"
                                name="tos"
                                type="checkbox"
                                required
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 transition-all"
                            />
                            <label htmlFor="tos" className="text-gray-400 text-sm">
                                {dict.signup.tosPrefix}{' '}
                                <Link href="/terms-of-service" className="text-white underline hover:text-gray-300">
                                    {dict.signup.tosLink}
                                </Link>
                                {dict.signup.tosAnd}
                                <Link href="/privacy-policy" className="text-white underline hover:text-gray-300">
                                    {dict.signup.privacyLink}
                                </Link>
                            </label>
                        </div>
                    </Field>

                    <div className="mb-4 flex justify-center">
                        <Turnstile
                            siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY ?? ''}
                            options={{ theme: 'dark' }}
                        />
                    </div>

                    {errorMessage && (
                        <p className="text-red-500 text-sm mb-4 text-center">
                            {errorMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 font-medium bg-blue-600 text-white rounded-md mt-2 hover:bg-blue-500 transition-colors disabled:opacity-50"
                    >
                        {isPending ? dict.signup.submitLoading : dict.signup.submit}
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            {dict.signup.haveAccount}{' '}
                            <Link href="/login" className="text-white underline hover:text-gray-300" target='_blank'>
                                {dict.signup.loginLink}
                            </Link>
                        </p>
                    </div>
                </form>
            </FormContainer>
        </div>
    );
};

export default SignUpBox;