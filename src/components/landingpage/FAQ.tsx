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
        <div className="relative bg-[#0a0a0a] border-y border-[#1b1b1d] overflow-hidden">
            {/* Subtle radial background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(59,130,246,0.04)_0%,transparent_60%)] pointer-events-none" />

            <div className="relative mx-auto max-w-screen-xl sm:px-10 px-5 py-20 mb-20">
                {/* Header */}
                <div className="flex flex-col justify-center items-center text-center">
                    {/* Decorative label */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-500/50" />
                        <span className="text-blue-400 text-xs font-semibold uppercase tracking-[0.18em]">
                            {dict.faq.title}
                        </span>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-500/50" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        {dict.faq.undertitle}
                    </h2>
                </div>

                {/* Accordion */}
                <div className="mt-12 max-w-3xl mx-auto">
                    {dict.faq.questions.map((q: any, i: number) => {
                        const isOpen = openIndex === i;

                        return (
                            <div
                                key={i}
                                className={`border-b transition-colors duration-200 ${
                                    isOpen ? "border-[#3b82f6]/20" : "border-[#2e2e2e]"
                                }`}
                            >
                                {/* Question */}
                                <button
                                    onClick={() => toggle(i)}
                                    className="w-full flex items-center justify-between py-5 text-left group"
                                >
                                    <span className={`text-lg font-medium transition-colors duration-200 ${
                                        isOpen
                                            ? "text-blue-400"
                                            : "text-white group-hover:text-blue-300"
                                    }`}>
                                        {q.question}
                                    </span>

                                    <ChevronDown
                                        className={`flex-shrink-0 ml-4 transition-all duration-300 ${
                                            isOpen
                                                ? "text-blue-400 rotate-180"
                                                : "text-neutral-500 group-hover:text-blue-300"
                                        }`}
                                        size={18}
                                    />
                                </button>

                                {/* Answer */}
                                <div
                                    ref={(el) => {
                                        refs.current[i] = el;
                                    }}
                                    style={{
                                        height: isOpen
                                            ? refs.current[i]?.scrollHeight
                                            : 0,
                                    }}
                                    className="overflow-hidden transition-[height] duration-300 ease-in-out"
                                >
                                    <div className="pb-5 pl-4 border-l-2 border-[#3b82f6]/30">
                                        <p className="text-gray-400">{q.answer}</p>
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