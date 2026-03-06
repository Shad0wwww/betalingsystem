'use client'
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import "@/components/modals/styles.css";
import { MeterStatus, UtilityType } from "@prisma/client";

export interface MeterData {
    id?: string;
    deviceId: string;
    status: MeterStatus;
    location: string;
    type: UtilityType;
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

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
        {...props}
        className="w-full border rounded-md p-3 sm:p-2 border-[#292828] bg-[#111111] text-white focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all"
    />
);

export default function RegisterMeterModal({
    onSuccess
}: {
    onSuccess: (newMeter: MeterData) => void;
}) {
    const [deviceId, setDeviceId] = useState("");
    const [status, setStatus] = useState<MeterStatus>(MeterStatus.INACTIVE);
    const [location, setLocation] = useState("");
    const [type, setType] = useState<UtilityType>(UtilityType.ELECTRICITY);

    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setDeviceId("");
            setStatus(MeterStatus.INACTIVE);
            setLocation("");
            setType(UtilityType.ELECTRICITY);
            setError(null);
            setIsLoading(false);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!deviceId.trim() || !location.trim()) {
            setError("Venligst udfyld alle felter.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/modbus/register/meter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    deviceId: deviceId.trim(),
                    status,
                    location: location.trim(),
                    type,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Der skete en fejl under oprettelsen.");
            }

            onSuccess(data.meter || { deviceId: deviceId.trim(), status, location: location.trim(), type });
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
                REGISTRÉR MÅLER
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent box-color custom-border box-shadow">
                    <Dialog.Title className="text-white font-semibold text-lg mb-6">
                        Opret ny måler
                    </Dialog.Title>

                    <form onSubmit={handleSubmit}>
                        <Field label="Device ID">
                            <Input
                                type="text"
                                placeholder="Indtast device ID"
                                value={deviceId}
                                onChange={(e) => setDeviceId(e.target.value)}
                                disabled={isLoading}
                            />
                        </Field>

                        <Field label="Status">
                            <Select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as MeterStatus)}
                                disabled={isLoading}
                            >
                                <option value={MeterStatus.ACTIVE}>Aktiv</option>
                                <option value={MeterStatus.INACTIVE}>Inaktiv</option>
                                <option value={MeterStatus.MAINTENANCE}>Vedligeholdelse</option>
                            </Select>
                        </Field>

                        <Field label="Lokation">
                            <Input
                                type="text"
                                placeholder="Indtast lokation"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                disabled={isLoading}
                            />
                        </Field>

                        <Field label="Type">
                            <Select
                                value={type}
                                onChange={(e) => setType(e.target.value as UtilityType)}
                                disabled={isLoading}
                            >
                                <option value={UtilityType.ELECTRICITY}>Elektricitet</option>
                                <option value={UtilityType.WATER}>Vand</option>
                            </Select>
                        </Field>

                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 font-medium bg-white text-black rounded-md mt-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Opretter..." : "Opret Måler"}
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
