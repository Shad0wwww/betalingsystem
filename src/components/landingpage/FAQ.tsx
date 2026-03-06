"use client";
import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQ(
    { dict }: { dict: any }
) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const refs = useRef<(HTMLDivElement | null)[]>([]);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="relative bg-[#0a0a0a] overflow-hidden min-h-[70vh] flex flex-col justify-center">
            {/* Subtle radial background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(59,130,246,0.05)_0%,transparent_65%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_10%,transparent_100%)] pointer-events-none" />

            <div className="relative mx-auto w-full max-w-screen-xl sm:px-10 px-5 py-24">
                {/* Header */}
                <div className="flex flex-col justify-center items-center text-center mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px w-6 bg-gradient-to-r from-transparent to-blue-500/50" />
                        <span className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
                            {dict.faq.title}
                        </span>
                        <div className="h-px w-6 bg-gradient-to-l from-transparent to-blue-500/50" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                        {dict.faq.undertitle}
                    </h2>
                </div>

                {/* Accordion */}
                <div className="max-w-2xl mx-auto w-full">
                    {dict.faq.questions.map((q: any, i: number) => {
                        const isOpen = openIndex === i;
                        const isLast = i === dict.faq.questions.length - 1;

                        return (
                            <div
                                key={i}
                                className={`transition-colors duration-200 ${!isLast ? "border-b" : ""} ${
                                    isOpen ? "border-blue-500/15" : "border-white/[0.06]"
                                }`}
                            >
                                {/* Question */}
                                <button
                                    onClick={() => toggle(i)}
                                    className="w-full flex items-center justify-between py-5 text-left group"
                                >
                                    <span className={`text-[15px] font-medium transition-colors duration-200 pr-4 ${
                                        isOpen
                                            ? "text-blue-400"
                                            : "text-white/80 group-hover:text-white"
                                    }`}>
                                        {q.question}
                                    </span>

                                    <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-300 ${
                                        isOpen
                                            ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                                            : "border-white/10 text-white/30 group-hover:border-white/20 group-hover:text-white/50"
                                    }`}>
                                        <ChevronDown
                                            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                            size={13}
                                        />
                                    </span>
                                </button>

                                {/* Answer */}
                                <div
                                    ref={(el) => { refs.current[i] = el; }}
                                    style={{ height: isOpen ? refs.current[i]?.scrollHeight : 0 }}
                                    className="overflow-hidden transition-[height] duration-300 ease-in-out"
                                >
                                    <div className="pb-5 pr-8">
                                        <p className="text-sm text-white/45 leading-relaxed">{q.answer}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}