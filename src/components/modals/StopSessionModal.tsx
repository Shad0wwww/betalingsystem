'use client'

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import "@/components/modals/styles.css";
import { UtilityType } from "@prisma/client";

export interface StopSessionData {
    id: number;
    userId: string;
    userName: string;
    userEmail: string;
    boatName: string;
    meterDeviceId: string;
    type: UtilityType;
    startTime: string;
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

const typeLabels: Record<UtilityType, string> = {
    ELECTRICITY: "Elektricitet",
    WATER: "Vand",
};

interface StopSessionModalProps {
    session: StopSessionData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function StopSessionModal({ session, open, onOpenChange, onSuccess }: StopSessionModalProps) {
    const [stopComment, setStopComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (session) {
            setStopComment("");
            setError(null);
        }
    }, [session]);

    useEffect(() => {
        if (!open) {
            setError(null);
            setIsLoading(false);
            setStopComment("");
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch(`/api/admin/sessions/${session.id}/stop`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stopComment: stopComment.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Der skete en fejl under stopningen af sessionen.");
            }

            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || "Der skete en fejl. Prøv igen.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!session) return null;

    const elapsedMs = Date.now() - new Date(session.startTime).getTime();
    const totalSec = Math.floor(elapsedMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const elapsed = h > 0 ? `${h}t ${String(m).padStart(2, "0")}m` : `${m}m ${String(s).padStart(2, "0")}s`;

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent">
                    <div className="mb-6">
                        <Dialog.Title className="text-white font-semibold text-xl mb-1">
                            Stop session
                        </Dialog.Title>
                        <p className="text-zinc-500 text-sm">
                            Afslut denne session og gør måleren tilgængelig igen.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Field label="Session-ID">
                            <Input
                                type="text"
                                value={`#${session.id}`}
                                disabled
                            />
                        </Field>

                        <Field label="Bruger">
                            <Input
                                type="text"
                                value={session.userName}
                                disabled
                            />
                        </Field>

                        <Field label="Båd">
                            <Input
                                type="text"
                                value={session.boatName}
                                disabled
                            />
                        </Field>

                        <Field label="Måler">
                            <Input
                                type="text"
                                value={`${session.meterDeviceId} (${typeLabels[session.type]})`}
                                disabled
                            />
                        </Field>

                        <Field label="Varighed">
                            <Input
                                type="text"
                                value={elapsed}
                                disabled
                            />
                        </Field>

                        <Field label="Kommentar (valgfri)">
                            <Textarea
                                placeholder="Angiv en årsag til stopningen..."
                                value={stopComment}
                                onChange={(e) => setStopComment(e.target.value)}
                                disabled={isLoading}
                                maxLength={500}
                                rows={3}
                            />
                            <p className="text-zinc-500 text-xs mt-1">
                                {stopComment.length}/500
                            </p>
                        </Field>

                        {error && (
                            <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className="modal-submit-btn">
                            {isLoading ? "Stopper..." : "Stop session"}
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
