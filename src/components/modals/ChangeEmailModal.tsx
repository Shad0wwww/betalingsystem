'use client';
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import "@/components/modals/styles.css";
import { Cross2Icon } from "@radix-ui/react-icons";
import { confirmEmailChange } from "@/lib/actions/settings";

// Ændret 'label' typen til ReactNode, så vi kan sende HTML/spans med ind
const Field = ({ label, error, children }: { label: React.ReactNode; error?: string; children: React.ReactNode }) => (
    <div className="mb-5">
        <label className="block text-zinc-400 font-medium text-sm mb-1.5">
            {label}
        </label>
        {children}
        {error && <p className="text-red-400 text-xs mt-1.5 font-medium">{error}</p>}
    </div>
);

const Input = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`modal-input ${className}`}
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
            await confirmEmailChange(otpOld, otpNew, newEmail!);
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
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-[#2563eb] hover:bg-[#1d4ed8] text-white border border-blue-600/40 shadow-md shadow-blue-900/30
                 ${(disabled || isSendingRequest) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isSendingRequest ? "Sender koder..." : (dict?.dashboard?.settings?.sendemail ?? 'Ret email')}
            </button>

            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
                <Dialog.Content className="DialogContent">

                    <div className="mb-6">
                        <Dialog.Title className="text-white font-semibold text-xl mb-1">
                            Godkend ændring af email
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-zinc-500">
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
                            className="modal-submit-btn"
                        >
                            {isLoading ? "Godkender..." : "Godkend ændring af email"}
                        </button>
                    </form>

                    <Dialog.Close asChild>
                        <button
                            className="IconButton"
                            aria-label="Close"
                            disabled={isLoading}
                        >
                            <Cross2Icon />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}