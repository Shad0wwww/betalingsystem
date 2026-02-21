"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { notFound, useRouter } from "next/navigation";
import LoginAction from "@/components/auth/LoginAction";
import VerifyOtpAction from "@/components/auth/VerifyOtpAction";
import { Turnstile } from "@marsidev/react-turnstile";

const FormContainer = (
    { children }: { children: React.ReactNode }
) => (
    <div className="border rounded-lg custom-box2 py-8 px-5 sm:py-10 sm:px-12 border-[#292828] bg-[#131313]">
        {children}
    </div>
);

const ErrorMessage = (
    { error }: { error: string | null }
) =>
    error ? (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
    ) : null;

const Label = (
    { children }: { children: React.ReactNode }
) => (
    <p className="text-white font-normal text-[15px] mb-2">{children}</p>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`w-full border rounded-md p-3 sm:p-2 border-[#292828] bg-[#111111] text-white focus:outline-none focus:ring-1 focus:ring-gray-500 ${props.className}`}
    />
);

const LoginBox: React.FC<{ dict: any }> = ({ dict }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [email, setEmail] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const router = useRouter();

    if (!dict) return notFound();

    const env = process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY;

    useEffect(() => setIsMounted(true), []);

    // Trin 1: Email Action
    const [error1, formAction1, isPending1] = useActionState(
        async (prevState: any, formData: FormData) => {
            const result = await LoginAction(prevState, formData);
            if (result?.success) {
                setEmail(formData.get("email") as string);
                setIsOtpSent(true);
            }
            return result?.error || null;
        },
        null,
    );

    // Trin 2: OTP Action
    const [error2, formAction2, isPending2] = useActionState(
        async (prevState: any, formData: FormData) => {
            const result = await VerifyOtpAction(prevState, formData);
            if (result?.success) router.push("/dashboard");
            return result?.error || null;
        },
        null,
    );

    if (!isMounted) return null;

    return (
        <div className="w-full max-w-md mx-auto px-4 sm:px-0">
            <FormContainer>
                {isOtpSent ? (

                    <div className="fade-in">
                        <h1 className="text-white font-bold text-2xl text-center mb-4">
                            {dict.login.otpTitle}
                        </h1>
                        <p className="text-gray-400 text-center text-sm mb-8">
                            {dict.login.otpIntro}{" "}
                            <span className="text-white font-semibold">{email}</span>
                        </p>

                        <form action={formAction2}>
                            <input type="hidden" name="email" value={email} />
                            <div className="mb-4">
                                <Label>{dict.login.otpLabel}</Label>
                                <Input
                                    name="otp"
                                    placeholder={dict.login.otpPlaceholder}
                                    maxLength={6}
                                    className="text-center text-xl tracking-[0.3em] sm:text-2xl sm:tracking-[0.5em] font-mono"
                                    autoFocus
                                    required
                                />

                            </div>

                            <ErrorMessage error={error2} />

                            <button
                                type="submit"
                                disabled={isPending2}
                                className="w-full py-3 font-medium bg-white text-black rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {isPending2 ? dict.login.loginButtonLoading : dict.login.loginButton}
                            </button>
                        </form>

                        <button
                            onClick={() => setIsOtpSent(false)}
                            className="text-gray-400 text-xs mt-6 underline block mx-auto hover:text-white"
                        >
                            {dict.login.backToEmail}
                        </button>
                    </div>
                ) : (
                    /* EMAIL TRIN */
                    <div className="fade-in">
                        <h1 className="text-white font-bold text-2xl text-center mb-2">
                            {dict.login.title}
                        </h1>
                        <p className="text-gray-400 text-center text-sm mb-8">
                            {dict.login.subtitle}
                        </p>

                        <form action={formAction1}>
                            <div className="mb-6">
                                <Label>{dict.login.emailLabel}</Label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder={dict.login.emailPlaceholder}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="mb-4 flex justify-center max-w-full overflow-hidden">
                                <Turnstile
                                    siteKey={env ?? ''}
                                    options={{ theme: 'dark' }}
                                />
                            </div> 

                            <ErrorMessage error={error1} />

                            <button
                                type="submit"
                                disabled={isPending1}
                                className="w-full py-3 font-medium bg-white text-black rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {isPending1 ? dict.login.sendOtpButtonLoading : dict.login.sendOtpButton}
                            </button>
                        </form>

                        <div className="text-center mt-6">
                            <p className="text-gray-400 text-sm">
                                {dict.login.noAccount}{" "}
                                <Link
                                    href="/signup"
                                    className="text-white underline hover:text-gray-300"
                                >
                                    {dict.login.createAccount}
                                </Link>
                            </p>
                        </div>
                    </div>
                )}
            </FormContainer>
        </div>
    );
};

export default LoginBox;
