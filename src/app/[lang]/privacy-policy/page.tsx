import { Suspense } from "react";
import { getDictionary } from "../dictionaries";
import LoadingScreen from "@/components/utils/LoadingScreen";

type PageParams = Promise<{ lang: string }>;

const PolicySection = (
    { title, content, index }: { title: string; content: string; index: number }
) => (
    <section className="relative">
        <div className="flex items-start gap-4">
            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mt-0.5">
                {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
                <p className="text-zinc-400 leading-relaxed whitespace-pre-line text-[0.9375rem]">{content}</p>
            </div>
        </div>
    </section>
);

async function PrivacyPolicyPage({ params }: { params: PageParams }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const privacypolicy = dict.privacypolicy;

    const sections = [
        privacypolicy.section1,
        privacypolicy.section2,
        privacypolicy.section3,
        privacypolicy.section4,
        privacypolicy.section5,
        privacypolicy.section6,
        privacypolicy.section7,
        privacypolicy.section8,
    ];

    return (
        <main className="relative min-h-screen bg-[#0d0d0d] overflow-hidden font-sans">
            {/* Grid background */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                    maskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black 30%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black 30%, transparent 100%)',
                }}
            />
            {/* Top blue glow */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[260px] rounded-full bg-blue-600/10 blur-[100px]" />

            <div className="relative z-10 max-w-[860px] mx-auto px-4 sm:px-8 py-16 sm:py-24">

                {/* Header */}
                <header className="mb-14">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="h-px w-6 bg-gradient-to-r from-transparent to-blue-500/50" />
                        <span className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
                            Juridisk
                        </span>
                        <div className="h-px w-6 bg-gradient-to-l from-transparent to-blue-500/50" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                        {privacypolicy.title}
                    </h1>
                    <p className="text-sm text-zinc-500">Senest opdateret: 22. Februar, 2026</p>
                </header>

                {/* Card */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 sm:p-10 shadow-2xl">

                    {/* Intro */}
                    <div className="mb-10">
                        <h2 className="text-lg font-semibold text-white mb-3">{privacypolicy.undertitle}</h2>
                        <p className="text-zinc-400 leading-relaxed text-[0.9375rem] mb-6">{privacypolicy.introduction}</p>

                        <address className="not-italic bg-blue-500/[0.05] border border-blue-500/[0.15] rounded-xl p-5">
                            <h3 className="text-blue-400 font-semibold mb-3 text-xs uppercase tracking-wider">
                                {privacypolicy.publisher.title}
                            </h3>
                            <div className="text-zinc-400 text-sm space-y-1">
                                <p className="font-semibold text-zinc-200">Ribe Sejlklub ApS</p>
                                <p>Erik Menvedsvej 20, 6760 Ribe</p>
                                <p>CVR: 74852513</p>
                                <p>Email:{' '}
                                    <a href="mailto:support@pins.dk" className="text-blue-400 hover:text-blue-300 transition-colors">
                                        support@pins.dk
                                    </a>
                                </p>
                            </div>
                        </address>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

                    {/* Sections */}
                    <div className="space-y-10">
                        <Suspense fallback={<LoadingScreen />}>
                            {sections.map((section, index) => (
                                <PolicySection
                                    key={index}
                                    index={index}
                                    title={section.title}
                                    content={section.content}
                                />
                            ))}
                        </Suspense>

                    </div>
                </div>
            </div>
        </main>
    );
}

export default PrivacyPolicyPage;