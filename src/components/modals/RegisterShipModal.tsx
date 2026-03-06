'use client'
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import "@/components/modals/styles.css";

// 1. Definer en type for det skib, vi sender tilbage
export interface ShipData {
    id?: string;
    name: string;
    model: string;
}

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

export default function RegisterShipModal({
    onSuccess
}: {
    onSuccess: (newShip: ShipData) => void;
}) {
    const [name, setName] = useState("");
    const [model, setModel] = useState("");

    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setName("");
            setModel("");
            setError(null);
            setIsLoading(false);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!name.trim() || !model.trim()) {
            setError("Venligst udfyld alle felter.");
            return;
        }

        setIsLoading(true);

        try {
            // 3. Ren async/await i stedet for at blande med .then()
            const res = await fetch("/api/boat/registerboat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: name.trim(), model: model.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Der skete en fejl under oprettelsen.");
            }
            onSuccess(data.ship || { name: name.trim(), model: model.trim() });
            setOpen(false);
        } catch (err: any) {
            setError(err.message || "Der skete en fejl. Prøv igen senere.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className="px-4 py-1.5 rounded-md text-sm font-semibold transition-all bg-[#2563eb] hover:bg-[#1d4ed8] text-white border border-blue-600/40 shadow-md shadow-blue-900/30">
                REGISTRÉR SKIB
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent">
                    <div className="mb-6">
                        <Dialog.Title className="text-white font-semibold text-xl mb-1">
                            Opret nyt skib
                        </Dialog.Title>
                        <p className="text-zinc-500 text-sm">Registrér dit skib for at kunne tilslutte målere.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Field label="Skibets navn">
                            <Input
                                type="text"
                                placeholder="Indtast skibets navn"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading} // God praksis at deaktivere inputs under load
                            />
                        </Field>

                        <Field label="Skibets model">
                            <Input
                                type="text"
                                placeholder="F.eks. Bavaria 37"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                disabled={isLoading}
                            />
                        </Field>

                        {error && (
                            <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className="modal-submit-btn">
                            {isLoading ? "Opretter..." : "Opret skib"}
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