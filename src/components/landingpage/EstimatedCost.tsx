"use client";

import { useState, useMemo } from "react";
import { Zap, Calendar, Info } from "lucide-react";

const DEFAULT_DAILY_KWH = 3.5;

interface EstimatedCostProps {
    kwhPrice: number;
    dict: any;
}

export default function EstimatedCost({ kwhPrice, dict }: EstimatedCostProps) {
    const today = new Date().toISOString().split("T")[0];
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dailyKwh, setDailyKwh] = useState(DEFAULT_DAILY_KWH);

    const days = useMemo(() => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        return Math.max(0, diff);
    }, [startDate, endDate]);

    const estimatedCost = useMemo(
        () => days * dailyKwh * kwhPrice,
        [days, dailyKwh, kwhPrice]
    );

    return (
        <section className="relative bg-[#0a0a0a] py-24 px-6 overflow-hidden">
            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(59,130,246,0.06)_0%,transparent_65%)] pointer-events-none" />

            <div className="relative max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-[#3b82f6] font-semibold tracking-widest uppercase text-sm mb-4">
                        {dict.estimatedCost.label}
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        {dict.estimatedCost.title}
                    </h3>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        {dict.estimatedCost.subtitle}
                    </p>
                </div>

                {/* Calculator card */}
                <div className="relative p-8 rounded-2xl bg-white/5 border border-white/10">
                    {/* Top accent glow */}
                    <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* ── Left: inputs ── */}
                        <div className="space-y-6">
                            {/* Arrival date */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {dict.estimatedCost.arrivalDate}
                                </label>
                                <input
                                    type="date"
                                    min={today}
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        if (endDate && e.target.value > endDate) {
                                            setEndDate("");
                                        }
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors duration-150 [color-scheme:dark]"
                                />
                            </div>

                            {/* Departure date */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {dict.estimatedCost.departureDate}
                                </label>
                                <input
                                    type="date"
                                    min={startDate || today}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors duration-150 [color-scheme:dark]"
                                />
                            </div>

                            {/* Daily kWh input */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">
                                    {dict.estimatedCost.dailyConsumption}
                                </label>
                                <input
                                    type="number"
                                    min={0.1}
                                    max={100}
                                    step={0.1}
                                    value={dailyKwh}
                                    onChange={(e) =>
                                        setDailyKwh(Math.max(0.1, Number(e.target.value)))
                                    }
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors duration-150 [color-scheme:dark]"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {dict.estimatedCost.typicalConsumption}
                                </p>
                            </div>
                        </div>

                        {/* ── Right: results ── */}
                        <div className="space-y-4">
                            {/* Current kWh price */}
                            <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm text-gray-400">
                                        {dict.estimatedCost.currentPrice}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    {kwhPrice.toLocaleString("da-DK", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 4,
                                    })}{" "}
                                    <span className="text-sm font-normal text-gray-400">
                                        kr/kWh
                                    </span>
                                </p>
                            </div>

                            {/* Number of days */}
                            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-sm text-gray-400 block mb-1">
                                    {dict.estimatedCost.days}
                                </span>
                                <p className="text-2xl font-bold text-white">{days}</p>
                            </div>

                            {/* Estimated total */}
                            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-sm text-gray-400 block mb-1">
                                    {dict.estimatedCost.estimatedPrice}
                                </span>
                                <p className="text-3xl font-bold text-white">
                                    {estimatedCost.toLocaleString("da-DK", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}{" "}
                                    <span className="text-sm font-normal text-gray-400">kr</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-400">
                            <span className="text-amber-400 font-medium">
                                {dict.estimatedCost.disclaimerLabel}
                            </span>{" "}
                            {dict.estimatedCost.disclaimer}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
