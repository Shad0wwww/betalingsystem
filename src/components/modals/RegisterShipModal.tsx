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
        <label className="block text-white font-normal text-[15px] leading-none mb-2">
            {label}
        </label>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className="w-full border rounded-md p-3 sm:p-2 border-[#292828] bg-[#111111] text-white focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all placeholder:text-zinc-600"
    />
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
            <Dialog.Trigger className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors bg-white hover:bg-gray-200 text-black">
                REGISTRÉR SKIB
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent box-color custom-border box-shadow">
                    <Dialog.Title className="text-white font-semibold text-lg mb-6">
                        Opret nyt skib
                    </Dialog.Title>

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

                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 font-medium bg-white text-black rounded-md mt-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Opretter..." : "Opret Skib"}
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