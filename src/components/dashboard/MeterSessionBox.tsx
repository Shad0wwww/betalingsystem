'use client';

import { useEffect, useState } from "react";
import BrugerRegisterMeterModal from "../modals/BrugerRegisterMeterModal";
import { UtilityType } from "@prisma/client";
import { Zap, Droplets, MapPin, Anchor } from "lucide-react";
import { getActiveSession, stopSession, getLatestMeterReading } from "@/lib/actions/dashboard";

interface ActiveSession {
    id: number;
    meterId: number;
    startTime: Date;
    startValue: number;
    type: UtilityType;
    meter: { deviceId: string; location: string | null; type: UtilityType };
    boat: { kaldeNavn: string; skibModel: string };
}

const RATE_PER_KWH = 3.0; // DKK per kWh — skal matche server action

const typeConfig: Record<UtilityType, { label: string; Icon: React.ElementType; color: string }> = {
    ELECTRICITY: { label: "Elektricitet", Icon: Zap, color: "#facc15" },
    WATER: { label: "Vand", Icon: Droplets, color: "#60a5fa" },
};

function formatDuration(startTime: Date) {
    const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return [h > 0 ? `${h}t` : null, `${m}m`, `${s}s`].filter(Boolean).join(" ");
}

export default function MeterSessionBox({ dict }: { dict?: any }) {
    const [session, setSession] = useState<ActiveSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [isStopping, setIsStopping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState("");
    const [currentKwh, setCurrentKwh] = useState<number | null>(null);

    const fetchSession = () => {
        setLoading(true);
        getActiveSession()
            .then((data) => {
                setSession(data.session ?? null);
                if (data.session) {
                    setCurrentKwh(null);
                }
            })
            .catch(() => setSession(null))
            .finally(() => setLoading(false));
    };

    // Fetch latest kWh reading periodically
    useEffect(() => {
        if (!session) return;
        const load = () => {
            getLatestMeterReading(session.meterId)
                .then((data) => { if (data.reading) setCurrentKwh(data.reading.value); })
                .catch(() => {});
        };
        load();
        const interval = setInterval(load, 30_000);
        return () => clearInterval(interval);
    }, [session?.meterId]);

    useEffect(() => {
        fetchSession();
    }, []);

    // Live elapsed timer
    useEffect(() => {
        if (!session) return;
        setElapsed(formatDuration(session.startTime));
        const interval = setInterval(() => {
            setElapsed(formatDuration(session.startTime));
        }, 1000);
        return () => clearInterval(interval);
    }, [session]);

    const handleStop = async () => {
        if (!session) return;
        setIsStopping(true);
        setError(null);
        try {
            await stopSession(session.id);
            setSession(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsStopping(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                <div className="h-4 w-32 rounded animate-pulse bg-[#1a1a1a]" />
                <div className="h-4 w-48 rounded animate-pulse bg-[#1a1a1a]" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex flex-col gap-3">
                <div>
                    <p className="text-sm font-medium text-white mb-0.5">Tilslut en måler</p>
                    <p className="text-xs text-zinc-500">Du er ikke forbundet til nogen måler.</p>
                </div>
                <BrugerRegisterMeterModal dict={dict} onSuccess={fetchSession} />
            </div>
        );
    }

    const { label, Icon, color } = typeConfig[session.meter.type];
    const kwhUsed = currentKwh !== null ? Math.max(0, currentKwh - session.startValue) : null;
    const estimatedCost = kwhUsed !== null ? kwhUsed * RATE_PER_KWH : null;

    return (
        <div className="flex flex-col gap-4">
            {/* Status badge */}
            <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-sm font-medium text-green-400">Aktiv session</span>
                <span className="ml-auto text-xs text-zinc-500 font-mono">{elapsed}</span>
            </div>

            {/* Info rows */}
            <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                    <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                    <span className="text-zinc-400">Type</span>
                    <span className="ml-auto text-white font-medium">{label}</span>
                </div>

                <div className="flex items-center gap-2.5 text-sm">
                    <Zap className="w-4 h-4 shrink-0 text-zinc-600" />
                    <span className="text-zinc-400">Stander</span>
                    <span className="ml-auto text-white font-mono text-xs">{session.meter.deviceId}</span>
                </div>

                {session.meter.location && (
                    <div className="flex items-center gap-2.5 text-sm">
                        <MapPin className="w-4 h-4 shrink-0 text-zinc-600" />
                        <span className="text-zinc-400">Lokation</span>
                        <span className="ml-auto text-white">{session.meter.location}</span>
                    </div>
                )}

                <div className="flex items-center gap-2.5 text-sm">
                    <Anchor className="w-4 h-4 shrink-0 text-zinc-600" />
                    <span className="text-zinc-400">Båd</span>
                    <span className="ml-auto text-white">{session.boat.kaldeNavn}</span>
                </div>

                {/* kWh section */}
                <div className="pt-1 border-t border-[#292828] space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm">
                        <Zap className="w-4 h-4 shrink-0 text-zinc-600" />
                        <span className="text-zinc-400">Start kWh</span>
                        <span className="ml-auto text-white font-mono tabular-nums">
                            {session.startValue.toFixed(3)} kWh
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm">
                        <Zap className="w-4 h-4 shrink-0 text-zinc-600" />
                        <span className="text-zinc-400">Nuværende kWh</span>
                        <span className="ml-auto text-white font-mono tabular-nums">
                            {currentKwh !== null ? `${currentKwh.toFixed(3)} kWh` : "–"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm">
                        <Zap className="w-4 h-4 shrink-0 text-yellow-600" />
                        <span className="text-zinc-400">Forbrug</span>
                        <span className="ml-auto text-yellow-400 font-mono font-semibold tabular-nums">
                            {kwhUsed !== null ? `${kwhUsed.toFixed(3)} kWh` : "–"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm">
                        <Zap className="w-4 h-4 shrink-0 text-zinc-600" />
                        <span className="text-zinc-400">Est. pris</span>
                        <span className="ml-auto text-white font-semibold tabular-nums">
                            {estimatedCost !== null
                                ? estimatedCost.toLocaleString("da-DK", { style: "currency", currency: "DKK" })
                                : "–"}
                        </span>
                    </div>
                </div>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            {/* Disconnect button */}
            <button
                onClick={handleStop}
                disabled={isStopping}
                className="w-full py-2.5 text-sm font-medium rounded-md border border-red-800/60 bg-red-950/30 text-red-400 hover:bg-red-900/40 hover:border-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isStopping ? "Afbryder..." : "Afbryd forbindelse"}
            </button>
        </div>
    );
}

