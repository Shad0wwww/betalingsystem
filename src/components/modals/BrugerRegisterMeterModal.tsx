'use client';
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useParams } from "next/navigation";
import "@/components/modals/styles.css";
import { UtilityType } from "@prisma/client";
import { getAvailableMeters, getMyBoats, createMeterSession } from "@/lib/actions/dashboard";

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
        <label className="block text-zinc-400 font-medium text-sm mb-1.5">
            {label}
        </label>
        {children}
        {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="modal-input" />
);

export default function BrugerRegisterMeterModal({
    onSuccess,
    dict,
}: {
    onSuccess?: () => void;
    dict?: any;
}) {
    const params = useParams<{ lang?: string }>();
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
            getAvailableMeters(),
            getMyBoats(),
        ])
            .then(([meterRes, boatRes]) => {
                setMeters(meterRes.meters ?? []);
                setBoats(Array.isArray(boatRes) ? boatRes : []);
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
            const data = await createMeterSession(
                Number(selectedMeter),
                Number(selectedBoat),
            );

            onSuccess?.();
            setOpen(false);
            if (data.url) window.location.href = data.url;
        } catch (err: any) {
            setError(err.message || "Der skete en fejl. Prøv igen.");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedMeterData = meters.find((m) => m.id === Number(selectedMeter));
    const settingsHref = `/${params?.lang ?? "da"}/dashboard/settings`;
    const noBoatsText = dict?.dashboard?.meterModal?.noBoatsText ?? "Du har ingen registrerede både endnu.";
    const goToSettingsText = dict?.dashboard?.meterModal?.goToSettingsRegisterBoat ?? "Gå til Indstillinger og registrér båd";

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className="px-4 py-1.5 rounded-md text-sm font-semibold transition-all bg-[#2563eb] hover:bg-[#1d4ed8] text-white border border-blue-600/40 shadow-md shadow-blue-900/30">
                TILSLUT MÅLER
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent">
                    <div className="mb-6">
                        <Dialog.Title className="text-white font-semibold text-xl mb-1">
                            Tilslut måler
                        </Dialog.Title>
                        <p className="text-zinc-500 text-sm">
                            Vælg en ledig måler og din båd for at starte en session.
                        </p>
                    </div>

                    {isFetching ? (
                        <div className="space-y-3 mb-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-11 rounded-md animate-pulse bg-[#0d1929] border border-blue-950/50" />
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
                                    <div className="py-2 space-y-3">
                                        <p className="text-zinc-500 text-sm">{noBoatsText}</p>
                                        <Link
                                            href={settingsHref}
                                            onClick={() => setOpen(false)}
                                            className="inline-flex items-center justify-center rounded-md border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-200 transition hover:bg-blue-500/20 hover:text-white"
                                        >
                                            {goToSettingsText}
                                        </Link>
                                    </div>
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
                                <div className="mb-4 p-3 rounded-md bg-blue-950/20 border border-blue-800/25 text-sm text-zinc-300 space-y-1">
                                    <p><span className="text-zinc-500">Måler:</span> {selectedMeterData.deviceId}{selectedMeterData.location ? ` — ${selectedMeterData.location}` : ""}</p>
                                    <p><span className="text-zinc-500">Type:</span> {typeLabels[selectedMeterData.type]}</p>
                                    <p><span className="text-zinc-500">Båd:</span> {boats.find((b) => b.id === Number(selectedBoat))?.kaldeNavn}</p>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || meters.length === 0 || boats.length === 0}
                                className="modal-submit-btn"
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
