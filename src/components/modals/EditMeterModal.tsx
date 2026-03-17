'use client'

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import "@/components/modals/styles.css";
import { MeterStatus, UtilityType } from "@prisma/client";

export interface EditMeterData {
    id: number;
    deviceId: string;
    status: MeterStatus;
    location: string | null;
    type: UtilityType;
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

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="modal-input" />
);

interface EditMeterModalProps {
    meter: EditMeterData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (updated: EditMeterData) => void;
}

export default function EditMeterModal({ meter, open, onOpenChange, onSuccess }: EditMeterModalProps) {
    const [deviceId, setDeviceId] = useState("");
    const [status, setStatus] = useState<MeterStatus>(MeterStatus.OFFLINE);
    const [location, setLocation] = useState("");
    const [type, setType] = useState<UtilityType>(UtilityType.ELECTRICITY);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Populate fields when meter changes
    useEffect(() => {
        if (meter) {
            setDeviceId(meter.deviceId);
            setStatus(meter.status);
            setLocation(meter.location ?? "");
            setType(meter.type);
            setError(null);
        }
    }, [meter]);

    // Reset error when dialog closes
    useEffect(() => {
        if (!open) {
            setError(null);
            setIsLoading(false);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!meter) return;
        setError(null);

        if (!deviceId.trim() || !location.trim()) {
            setError("Venligst udfyld alle felter.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`/api/modbus/meter/${meter.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deviceId: deviceId.trim(),
                    status,
                    location: location.trim(),
                    type,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Der skete en fejl under opdateringen.");
            }

            onSuccess(data.meter);
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || "Der skete en fejl. Prøv igen.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent">
                    <div className="mb-6">
                        <Dialog.Title className="text-white font-semibold text-xl mb-1">
                            Rediger måler
                        </Dialog.Title>
                        <p className="text-zinc-500 text-sm">
                            Opdatér oplysningerne for måler <span className="font-mono text-zinc-400">#{meter?.id}</span>.
                        </p>
                    </div>

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
                                <option value={MeterStatus.ONLINE}>Online</option>
                                <option value={MeterStatus.OFFLINE}>Offline</option>
                                <option value={MeterStatus.MAINTENANCE}>Vedligeholdelse</option>
                                <option value={MeterStatus.INUSE}>I brug</option>
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

                        {error && (
                            <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className="modal-submit-btn">
                            {isLoading ? "Gemmer..." : "Gem ændringer"}
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
