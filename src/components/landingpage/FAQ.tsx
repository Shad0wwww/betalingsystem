"use client";
import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQ({ dict }: { dict: any }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const refs = useRef<(HTMLDivElement | null)[]>([]);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="mx-auto max-w-screen-xl sm:px-10 px-5 py-16 mb-40">
            {/* Header */}
            <div className="flex flex-col justify-center items-center text-center">
                <h2 className="text-3xl font-bold text-white">
                    {dict.faq.title}
                </h2>
                <p className="text-[#cccccc] mt-4 text-lg max-w-2xl">
                    {dict.faq.undertitle}
                </p>
            </div>

            {/* Accordion */}
            <div className="mt-12 max-w-3xl mx-auto">
                {dict.faq.questions.map((q: any, i: number) => {
                    const isOpen = openIndex === i;

                    return (
                        <div key={i} className="border-b border-[#363636]">
                            {/* Question */}
                            <button
                                onClick={() => toggle(i)}
                                className="w-full flex items-center justify-between py-5 text-left"
                            >
                                <span className="text-white text-lg font-medium">
                                    {q.question}
                                </span>

                                <ChevronDown
                                    className={`text-white transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                        }`}
                                    size={17}
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
                                <div className="pb-5">
                                    <p className="text-white">{q.answer}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}