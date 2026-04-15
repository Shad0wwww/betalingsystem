"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Box } from "@/components/admin/Box";
import { Zap, Droplets, MapPin, Anchor, ArrowLeft } from "lucide-react";
import { UtilityType } from "@prisma/client";

interface SessionDetail {
    id: number;
    userId: string;
    userName: string;
    userEmail: string;
    boatId: number;
    boatName: string;
    boatModel: string;
    meterId: number;
    meterDeviceId: string;
    meterType: UtilityType;
    meterLocation: string | null;
    startTime: string;
    startValue: number;
    endTime: string | null;
    endValue: number | null;
    isActive: boolean;
    currentKwh: number | null;
    spotPris: number | null;
}

const FALLBACK_RATE_PER_KWH = 3.0;

function formatDuration(startTime: string, endTime?: string | null) {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const diff = Math.floor((end - start) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return [h > 0 ? `${h}t` : null, `${m}m`, `${s}s`].filter(Boolean).join(" ");
}

const typeConfig: Record<UtilityType, { label: string; Icon: React.ElementType; color: string }> = {
    ELECTRICITY: { label: "Elektricitet", Icon: Zap, color: "#facc15" },
    WATER: { label: "Vand", Icon: Droplets, color: "#60a5fa" },
};

export default function SessionDetailPage() {
    const router = useRouter();
    const params = useParams<{ lang: string; id: string }>();
    const sessionId = params?.id ? parseInt(params.id) : null;

    const [session, setSession] = useState<SessionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState("");

    const fetchSession = useCallback(async () => {
        if (!sessionId) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin/sessions/${sessionId}`, {
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setError("Session ikke fundet");
                } else if (response.status === 403) {
                    setError("Adgang nægtet");
                } else {
                    setError("Kunne ikke hente session-data");
                }
                setSession(null);
                return;
            }

            const data = await response.json();
            setSession(data.session);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Uventet fejl");
            setSession(null);
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    // Periodically refresh meter readings (every 30 seconds)
    useEffect(() => {
        if (!session || !session.isActive) return;

        const interval = setInterval(() => {
            fetchSession();
        }, 30_000);

        return () => clearInterval(interval);
    }, [session?.isActive, fetchSession]);

    // Live elapsed timer updates
    useEffect(() => {
        if (!session) return;

        const update = () => {
            setElapsed(formatDuration(session.startTime, session.endTime));
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [session]);

    if (loading) {
        return (
            <div className="min-h-screen pb-12">
                <div className="mx-auto max-w-screen-xl px-4 md:px-20 pt-8 pb-6">
                    <div className="h-4 w-32 rounded animate-pulse bg-[#1a1a1a] mb-4" />
                    <div className="h-10 w-48 rounded animate-pulse bg-[#1a1a1a]" />
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen pb-12">
                <div className="mx-auto max-w-screen-xl px-4 md:px-20 pt-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Tilbage
                    </button>
                    <Box>
                        <p className="text-red-400">{error || "Session ikke fundet"}</p>
                    </Box>
                </div>
            </div>
        );
    }

    const { label, Icon, color } = typeConfig[session.meterType];
    const startKwh = session.startValue;
    const currentKwh = session.currentKwh;
    const kwhUsed = currentKwh !== null ? Math.max(0, currentKwh - startKwh) : null;
    const rate = session.spotPris ?? FALLBACK_RATE_PER_KWH;
    const estimatedCost = kwhUsed !== null ? kwhUsed * rate : null;

    return (
        <div className="min-h-screen pb-12">
            {/* Page header */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20 pt-8 pb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Tilbage til sessioner
                </button>
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-5 bg-gradient-to-r from-transparent to-blue-500/50" />
                    <span className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
                        Session-detaljer
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-white">
                    {session.boatName} · Måler #{session.id}
                </h1>
                <p className="text-zinc-500 text-sm mt-1">
                    Session startet {new Date(session.startTime).toLocaleString("da-DK")}
                </p>
            </div>

            {/* Main content */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20">
                <Box>
                    {/* Status badge */}
                    <div className="flex items-center gap-2 mb-6 pb-6 border-b border-[#292828]">
                        {session.isActive ? (
                            <>
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                                </span>
                                <span className="text-sm font-medium text-green-400">Aktiv session</span>
                            </>
                        ) : (
                            <>
                                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-zinc-600" />
                                <span className="text-sm font-medium text-zinc-400">Afsluttet session</span>
                            </>
                        )}
                        <span className="ml-auto text-xs text-zinc-500 font-mono">{elapsed}</span>
                    </div>

                    {/* Session info grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left column - Basic info */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                                    Session-information
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                                        <span className="text-zinc-400">Type</span>
                                        <span className="ml-auto text-white font-medium">{label}</span>
                                    </div>

                                    <div className="flex items-center gap-2.5 text-sm">
                                        <Zap className="w-4 h-4 shrink-0 text-zinc-600" />
                                        <span className="text-zinc-400">Stander</span>
                                        <span className="ml-auto text-white font-mono text-xs">{session.meterDeviceId}</span>
                                    </div>

                                    {session.meterLocation && (
                                        <div className="flex items-center gap-2.5 text-sm">
                                            <MapPin className="w-4 h-4 shrink-0 text-zinc-600" />
                                            <span className="text-zinc-400">Lokation</span>
                                            <span className="ml-auto text-white">{session.meterLocation}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2.5 text-sm">
                                        <Anchor className="w-4 h-4 shrink-0 text-zinc-600" />
                                        <span className="text-zinc-400">Båd</span>
                                        <span className="ml-auto text-white">{session.boatName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                                    Bruger
                                </p>
                                <div className="space-y-2">
                                    <div className="text-sm">
                                        <p className="text-white font-medium">{session.userName}</p>
                                        <p className="text-zinc-500 text-xs">{session.userEmail}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right column - Consumption & Cost */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                                    Forbrug & pris
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <Zap className="w-4 h-4 shrink-0 text-zinc-600" />
                                        <span className="text-zinc-400">Start kWh</span>
                                        <span className="ml-auto text-white font-mono tabular-nums">
                                            {startKwh.toFixed(3)} kWh
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
                                        <span className="text-zinc-400">Spotpris</span>
                                        <span className="ml-auto font-mono tabular-nums text-xs">
                                            {session.spotPris !== null ? (
                                                <span className="text-yellow-400">{session.spotPris.toFixed(2)} kr/kWh</span>
                                            ) : (
                                                <span className="text-zinc-500">{FALLBACK_RATE_PER_KWH.toFixed(2)} kr/kWh (fast)</span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2.5 text-sm pt-1 border-t border-[#292828]">
                                        <Zap className="w-4 h-4 shrink-0 text-zinc-600" />
                                        <span className="text-zinc-400 font-semibold">Estimeret pris</span>
                                        <span className="ml-auto text-white font-semibold tabular-nums">
                                            {estimatedCost !== null
                                                ? estimatedCost.toLocaleString("da-DK", { style: "currency", currency: "DKK" })
                                                : "–"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Box>
            </div>
        </div>
    );
}
