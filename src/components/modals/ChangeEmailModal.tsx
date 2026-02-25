'use client';
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import "@/components/modals/styles.css";
import { Cross2Icon } from "@radix-ui/react-icons";

// Ændret 'label' typen til ReactNode, så vi kan sende HTML/spans med ind
const Field = ({ label, error, children }: { label: React.ReactNode; error?: string; children: React.ReactNode }) => (
    <div className="mb-5">
        <label className="block text-zinc-300 font-medium text-sm mb-2">
            {label}
        </label>
        {children}
        {error && <p className="text-red-400 text-xs mt-1.5 font-medium">{error}</p>}
    </div>
);

// Fixet: Nu overskriver den faste className ikke dine specifikke props
const Input = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`w-full border rounded-lg py-3 px-4 border-zinc-800 bg-[#111111] text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-500 transition-all placeholder:text-zinc-600 ${className}`}
    />
);

export default function ChangeEmail(
    { dict, newEmail, oldEmail, disabled, onAction }:
        { dict: any, newEmail?: string, oldEmail?: string, disabled?: boolean, onAction?: () => Promise<void> }
) {
    const [open, setOpen] = useState(false);
    const [newEmailState, setNewEmailState] = useState(newEmail!);
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingRequest, setIsSendingRequest] = useState(false); // Ny state til at håndtere API kaldet før modal åbner
    const [error, setError] = useState<string | null>(null);

    // Denne funktion kører, når brugeren klikker "Ret email"
    const handleInitialClick = async () => {
        if (onAction) {
            setIsSendingRequest(true);
            try {
                await onAction(); 
                setOpen(true);    
            } catch (err) {
                console.error("Fejl ved afsendelse af OTP");
            } finally {
                setIsSendingRequest(false);
            }
        } else {
            setOpen(true); 
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const otpOld = (e.currentTarget as any).otp_old.value;
        const otpNew = (e.currentTarget as any).otp_new.value;

        setIsLoading(true);
        try {

            await fetch(`/api/user/update-email/godkend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oldCode: otpOld,
                    newCode: otpNew,
                    newEmail: newEmail,
                })
            }).then(res => {
                if (!res.ok) throw new Error("Fejl ved godkendelse af email ændring");
                return res.json();
            });

            setOpen(false);
        } catch (err) {
            setError("Der skete en fejl ved opdatering af email.");
        } finally {
            setError(null);
            setIsLoading(false);
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>

            <button
                type="button"
                onClick={handleInitialClick}
                disabled={disabled || isSendingRequest}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white hover:bg-gray-200 text-black shadow-sm active:scale-[0.98]
                 ${(disabled || isSendingRequest) ? 'opacity-50 cursor-not-allowed active:scale-100' : ''}`}
            >
                {isSendingRequest ? "Sender koder..." : (dict?.dashboard?.settings?.sendemail ?? 'Ret email')}
            </button>

            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
                <Dialog.Content className="DialogContent box-color custom-border box-shadow fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl p-6 bg-[#0a0a0a] border border-zinc-800">

                    <div className="mb-6">
                        <Dialog.Title className="text-white font-semibold text-xl mb-1.5">
                            Godkend ændring af email
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-zinc-400">
                            Indtast engangskoderne sendt til dine indbakker.
                        </Dialog.Description>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Field
                            label={
                                <span>
                                    OTP sendt til <span className="text-zinc-500 font-normal">{oldEmail || "gammel email"}</span>
                                </span>
                            }
                        >
                            <Input
                                name="otp_old"
                                placeholder={dict?.login?.otpPlaceholder ?? "••••••"}
                                maxLength={6}
                                className="text-center text-2xl tracking-[0.4em] font-mono"
                                autoFocus
                                required
                            />
                        </Field>

                        <Field
                            label={
                                <span>
                                    OTP sendt til <span className="text-zinc-500 font-normal">{newEmail || "ny email"}</span>
                                </span>
                            }
                        >
                            <Input
                                name="otp_new"
                                placeholder={dict?.login?.otpPlaceholder ?? "••••••"}
                                maxLength={6}
                                className="text-center text-2xl tracking-[0.4em] font-mono"
                                required
                            />
                        </Field>

                        {error && (
                            <div className="p-3 mb-5 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                          
                            disabled={isLoading}
                            className="w-full py-3 bg-white text-black rounded-lg mt-2 hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isLoading ? "Godkender..." : "Godkend ændring af email"}
                        </button>
                    </form>

                    <Dialog.Close asChild>
                        <button
                            className="absolute top-4 right-4 p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none"
                            aria-label="Close"
                            disabled={isLoading}
                        >
                            <Cross2Icon className="w-5 h-5" />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}