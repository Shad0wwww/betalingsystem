'use client';
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import "@/components/modals/styles.css";
import { UtilityType } from "@prisma/client";

interface AvailableMeter {
    id: number;
    deviceId: string;
    location: string | null;
    type: UtilityType;
}

interface Boat {
    id: number;
    kaldeNavn: string;
    skibModel: string;
}

const typeLabels: Record<UtilityType, string> = {
    ELECTRICITY: "Elektricitet",
    WATER: "Vand",
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="mb-4">
        <label className="block text-white font-normal text-[15px] leading-none mb-2">
            {label}
        </label>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
        {...props}
        className="w-full border rounded-md p-3 sm:p-2 border-[#292828] bg-[#111111] text-white focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all disabled:opacity-50"
    />
);

export default function BrugerRegisterMeterModal({
    onSuccess,
    dict,
}: {
    onSuccess?: () => void;
    dict?: any;
}) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [meters, setMeters] = useState<AvailableMeter[]>([]);
    const [boats, setBoats] = useState<Boat[]>([]);
    const [selectedMeter, setSelectedMeter] = useState<string>("");
    const [selectedBoat, setSelectedBoat] = useState<string>("");

    useEffect(() => {
        if (!open) {
            setSelectedMeter("");
            setSelectedBoat("");
            setError(null);
            setIsLoading(false);
            return;
        }

        setIsFetching(true);
        Promise.all([
            fetch("/api/modbus/meter/available").then((r) => r.json()),
            fetch("/api/boat/myboats").then((r) => r.json()),
        ])
            .then(([meterRes, boatRes]) => {
                setMeters(meterRes.meters ?? []);
                // myboats returns an array directly
                setBoats(Array.isArray(boatRes) ? boatRes : (boatRes.boats ?? []));
            })
            .catch(() => setError("Kunne ikke hente data. Prøv igen."))
            .finally(() => setIsFetching(false));
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedMeter || !selectedBoat) {
            setError("Vælg venligst både måler og båd.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/modbus/session/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    meterId: Number(selectedMeter),
                    boatId: Number(selectedBoat),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Der skete en fejl.");
            }

            
            onSuccess?.();
            setOpen(false);
            window.location.href = data.url; 
        } catch (err: any) {
            setError(err.message || "Der skete en fejl. Prøv igen.");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedMeterData = meters.find((m) => m.id === Number(selectedMeter));

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors bg-white hover:bg-gray-200 text-black">
                TILSLUT MÅLER
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent box-color custom-border box-shadow">
                    <Dialog.Title className="text-white font-semibold text-lg mb-1">
                        Tilslut måler
                    </Dialog.Title>
                    <p className="text-zinc-400 text-sm mb-6">
                        Vælg en ledig måler og din båd for at starte en session.
                    </p>

                    {isFetching ? (
                        <div className="space-y-3 mb-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-11 rounded-md animate-pulse bg-[#1a1a1a] border border-[#292828]" />
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <Field label="Ledig måler">
                                {meters.length === 0 ? (
                                    <p className="text-zinc-500 text-sm py-2">Ingen ledige målere tilgængelige.</p>
                                ) : (
                                    <Select
                                        value={selectedMeter}
                                        onChange={(e) => setSelectedMeter(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="">Vælg måler...</option>
                                        {meters.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.deviceId}{m.location ? ` — ${m.location}` : ""} ({typeLabels[m.type]})
                                            </option>
                                        ))}
                                    </Select>
                                )}
                            </Field>

                            <Field label="Din båd">
                                {boats.length === 0 ? (
                                    <p className="text-zinc-500 text-sm py-2">Du har ingen registrerede både. Registrér en båd under Indstillinger.</p>
                                ) : (
                                    <Select
                                        value={selectedBoat}
                                        onChange={(e) => setSelectedBoat(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="">Vælg båd...</option>
                                        {boats.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.kaldeNavn} ({b.skibModel})
                                            </option>
                                        ))}
                                    </Select>
                                )}
                            </Field>

                            {/* Summary */}
                            {selectedMeterData && selectedBoat && (
                                <div className="mb-4 p-3 rounded-md bg-[#1a1a1a] border border-[#292828] text-sm text-zinc-300 space-y-1">
                                    <p><span className="text-zinc-500">Måler:</span> {selectedMeterData.deviceId}{selectedMeterData.location ? ` — ${selectedMeterData.location}` : ""}</p>
                                    <p><span className="text-zinc-500">Type:</span> {typeLabels[selectedMeterData.type]}</p>
                                    <p><span className="text-zinc-500">Båd:</span> {boats.find((b) => b.id === Number(selectedBoat))?.kaldeNavn}</p>
                                </div>
                            )}

                            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading || meters.length === 0 || boats.length === 0}
                                className="w-full py-3 font-medium bg-white text-black rounded-md mt-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Starter session..." : "Start session"}
                            </button>
                        </form>
                    )}

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
