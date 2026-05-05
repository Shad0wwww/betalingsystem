"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { notFound, useRouter } from "next/navigation";
import LoginAction from "@/components/auth/LoginAction";
import VerifyOtpAction from "@/components/auth/VerifyOtpAction";
import { Turnstile } from "react-turnstile";
import { Anchor } from "lucide-react";

const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_COOLDOWN_STORAGE_KEY = "otpCooldownUntil";

const FormContainer = (
    { children }: { children: React.ReactNode }
) => (
    <div className="relative border rounded-2xl custom-box2 py-8 px-5 sm:py-10 sm:px-12 border-white/[0.08] bg-[#0c0c0f] overflow-hidden shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
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
        className={`w-full border rounded-md p-3 sm:p-2 border-white/[0.08] bg-[#08080c] text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all ${props.className}`}
    />
);

const LoginBox: React.FC<{ dict: any, email?: string }> = ({ dict, email }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [emailInput, setEmailInput] = useState(email || '');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpCooldownUntil, setOtpCooldownUntil] = useState(0);
    const [otpCooldownLeft, setOtpCooldownLeft] = useState(0);
    const router = useRouter();

    if (!dict) return notFound();

    const env = process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY;

    useEffect(() => setIsMounted(true), []);

    useEffect(() => {
        const stored = Number(window.localStorage.getItem(OTP_COOLDOWN_STORAGE_KEY) || 0);
        if (stored > Date.now()) {
            setOtpCooldownUntil(stored);
        }
    }, []);

    useEffect(() => {
        const updateCooldown = () => {
            const remaining = Math.max(0, Math.ceil((otpCooldownUntil - Date.now()) / 1000));
            setOtpCooldownLeft(remaining);
            if (remaining <= 0 && otpCooldownUntil > 0) {
                setOtpCooldownUntil(0);
                window.localStorage.removeItem(OTP_COOLDOWN_STORAGE_KEY);
            }
        };

        updateCooldown();
        const id = window.setInterval(updateCooldown, 1000);
        return () => window.clearInterval(id);
    }, [otpCooldownUntil]);

    const startOtpCooldown = () => {
        const until = Date.now() + OTP_RESEND_COOLDOWN_SECONDS * 1000;
        setOtpCooldownUntil(until);
        window.localStorage.setItem(OTP_COOLDOWN_STORAGE_KEY, String(until));
    };

    // Trin 1: Email Action
    const [error1, formAction1, isPending1] = useActionState(
        async (prevState: any, formData: FormData) => {
            if (otpCooldownUntil > Date.now()) {
                const remaining = Math.max(1, Math.ceil((otpCooldownUntil - Date.now()) / 1000));
                return `Vent ${remaining} sekunder før du kan anmode om en ny kode.`;
            }

            const result = await LoginAction(prevState, formData);
            if (result?.success) {
                setEmailInput(formData.get("email") as string);
                setIsOtpSent(true);
                startOtpCooldown();
            }
            return result?.error || null;
        },
        null
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
            <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2 border border-white/[0.08] rounded-full px-4 py-1.5 bg-white/5 backdrop-blur-sm">
                    <Anchor className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-white/60 text-xs font-medium tracking-wide">Ribe Sejlklub</span>
                </div>
            </div>
            <FormContainer>
                {isOtpSent ? (

                    <div className="fade-in">
                        <h1 className="text-white font-bold text-2xl text-center mb-4">
                            {dict.login.otpTitle}
                        </h1>
                        <p className="text-gray-400 text-center text-sm mb-8">
                            {dict.login.otpIntro}{" "}
                            <span className="text-white font-semibold">{emailInput}</span>
                        </p>

                        <form action={formAction2}>
                            <input type="hidden" name="email" value={emailInput} />
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
                                className="w-full py-3 font-medium bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors disabled:opacity-50"
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
                                    value={emailInput}
                                    onChange={(e) => setEmailInput((e.target as HTMLInputElement).value)}
                                />
                            </div>
                            <div className="mb-4 flex justify-center max-w-full overflow-hidden">
                                <Turnstile
                                    sitekey={env ?? ''}
                                    theme="dark"
                                />
                            </div> 

                            <ErrorMessage error={error1} />

                            <button
                                type="submit"
                                disabled={isPending1 || otpCooldownLeft > 0}
                                className="w-full py-3 font-medium bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors disabled:opacity-50"
                            >
                                {isPending1
                                    ? dict.login.sendOtpButtonLoading
                                    : otpCooldownLeft > 0
                                        ? `Vent ${otpCooldownLeft}s`
                                        : dict.login.sendOtpButton}
                            </button>

                            {otpCooldownLeft > 0 && (
                                <p className="text-zinc-500 text-xs text-center mt-2">
                                    Du kan anmode om en ny engangskode om {otpCooldownLeft} sekunder.
                                </p>
                            )}
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
