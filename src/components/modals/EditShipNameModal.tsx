'use client'
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import "@/components/modals/styles.css";
import { updateBoatName } from "@/lib/actions/boat-actions";

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="mb-4">
        <label className="block text-zinc-400 font-medium text-sm mb-1.5">
            {label}
        </label>
        {children}
        {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="modal-input" />
);

export default function EditShipNameModal({
    boatId,
    currentName,
    dict,
    onSuccess,
}: {
    boatId: number;
    currentName: string;
    dict?: any;
    onSuccess: (updatedBoat: { id: number; name: string }) => void;
}) {
    const [name, setName] = useState(currentName);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setName(currentName);
            setError(null);
            setIsLoading(false);
        }
    }, [open, currentName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError(dict?.dashboard?.settings?.shipNameRequiredError ?? "Venligst udfyld bådens navn.");
            return;
        }

        setIsLoading(true);
        try {
            const updatedBoat = await updateBoatName(boatId, trimmedName);
            onSuccess(updatedBoat);
            setOpen(false);
        } catch (err: any) {
            setError(err.message || (dict?.dashboard?.settings?.genericError ?? "Der skete en fejl. Prøv igen."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className="rounded-md border border-blue-500/35 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-200 transition hover:bg-blue-500/20 hover:text-white">
                {dict?.dashboard?.settings?.editShipNameButton ?? "Rediger navn"}
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent">
                    <div className="mb-6">
                        <Dialog.Title className="text-white font-semibold text-xl mb-1">
                            {dict?.dashboard?.settings?.editShipNameTitle ?? "Rediger bådens navn"}
                        </Dialog.Title>
                        <p className="text-zinc-500 text-sm">
                            {dict?.dashboard?.settings?.editShipNameDescription ?? "Opdatér navnet på din båd."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Field label={dict?.dashboard?.settings?.shipName ?? "Navn"} error={error ?? undefined}>
                            <Input
                                type="text"
                                placeholder={dict?.dashboard?.settings?.shipNamePlaceholder ?? "Indtast bådens navn"}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                                maxLength={50}
                            />
                        </Field>

                        <button type="submit" disabled={isLoading} className="modal-submit-btn">
                            {isLoading
                                ? (dict?.dashboard?.settings?.savingShipName ?? "Gemmer...")
                                : (dict?.dashboard?.settings?.saveShipName ?? "Gem navn")}
                        </button>
                    </form>

                    <Dialog.Close asChild>
                        <button className="IconButton" aria-label="Close" disabled={isLoading}>
                            <Cross2Icon />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
