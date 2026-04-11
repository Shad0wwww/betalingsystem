import Link from "next/link";
import { Anchor } from "lucide-react";
import { headers } from "next/headers";
import { getDictionary } from "./dictionaries";
import "@/components/landingpage/landing.css";

export default async function NotFound() {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || headersList.get("referer") || "";

    // Extract language from pathname (e.g., /da/something -> da)
    const langMatch = pathname.match(/\/([a-z]{2})\//);
    const lang = langMatch ? langMatch[1] : "da-DK";
    
    let dict;
    try {
        dict = await getDictionary(lang);
    } catch {
        dict = await getDictionary("da");
    }

    return (
        <section className="relative overflow-hidden min-h-[80vh] flex items-center justify-center">
            {/* Grid baggrund */}
            <div className="hero-grid" aria-hidden="true" />

            {/* Blur blobs */}
            <div className="blurBlob blurBlob--center" aria-hidden="true" />
            <div className="blurBlob blurBlob--left" aria-hidden="true" />
            <div className="blurBlob blurBlob--right" aria-hidden="true" />

            <div className="relative z-10 mx-auto max-w-screen-xl px-5 sm:px-10">
                <div className="flex flex-col justify-center items-center">

                    {/* Badge */}
                    <div className="hero-badge mb-8">
                        <span className="hero-badge__dot" />
                        <Anchor className="w-3 h-3 opacity-70" />
                        {dict.notFound.badge}
                    </div>

                    {/* Content */}
                    <div className="hero-content text-center max-w-3xl flex flex-col justify-center items-center">
                        <h1 className="text-[8rem] sm:text-[12rem] md:text-[14rem] font-bold leading-none tracking-tight">
                            <span className="hero-gradient-text">{dict.notFound.title}</span>
                        </h1>
                        <p className="font-medium mt-6 text-lg max-w-xl text-gray-400 leading-relaxed">
                            {dict.notFound.description}
                        </p>
                    </div>

                    {/* Button */}
                    <div className="flex justify-center items-center mt-10">
                        <Link
                            href={`/${lang}`}
                            className="inline-flex items-center gap-2 whitespace-nowrap text-base font-sans px-6 py-3 duration-150 rounded-lg text-white shadow-2xl cursor-pointer text-center bg-[#262B31] hover:bg-[#363d45] border border-white/5"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m12 19-7-7 7-7"/>
                                <path d="M19 12H5"/>
                            </svg>
                            {dict.notFound.button}
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
