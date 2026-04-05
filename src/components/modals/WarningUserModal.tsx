'use client'

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import "@/components/modals/styles.css";

export interface WarningUserData {
    userId: string;
    userName: string;
    userEmail: string;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-4">
        <label className="block text-zinc-400 font-medium text-sm mb-1.5">{label}</label>
        {children}
    </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="modal-input" />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} className="modal-input resize-none" />
);

interface WarningUserModalProps {
    user: WarningUserData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function WarningUserModal({ user, open, onOpenChange, onSuccess }: WarningUserModalProps) {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setMessage("");
            setError(null);
        }
    }, [user]);

    useEffect(() => {
        if (!open) {
            setError(null);
            setIsLoading(false);
            setMessage("");
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setError(null);

        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
            setError("Advarselbesked er påkrævet");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`/api/admin/users/${user.userId}/warning`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: trimmedMessage,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Der skete en fejl ved sending af advarslen.");
            }

            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || "Der skete en fejl. Prøv igen.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent">
                    <div className="mb-6">
                        <Dialog.Title className="text-white font-semibold text-xl mb-1">
                            Send advarsel til bruger
                        </Dialog.Title>
                        <p className="text-zinc-500 text-sm">
                            Brugeren vil modtage en email med advarslen.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Field label="Bruger">
                            <Input
                                type="text"
                                value={user.userName}
                                disabled
                            />
                        </Field>

                        <Field label="Email">
                            <Input
                                type="email"
                                value={user.userEmail}
                                disabled
                            />
                        </Field>

                        <Field label="Advarselbesked *">
                            <Textarea
                                placeholder="Skriv en detaljeret besked til brugeren..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={isLoading}
                                maxLength={2000}
                                rows={5}
                            />
                            <p className="text-zinc-500 text-xs mt-1">
                                {message.length}/2000
                            </p>
                        </Field>

                        {error && (
                            <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading || !message.trim()} className="modal-submit-btn">
                            {isLoading ? "Sender..." : "Send advarsel"}
                        </button>
                    </form>

                    <Dialog.Close asChild>
                        <button className="IconButton" aria-label="Luk" disabled={isLoading}>
                            <Cross2Icon />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
