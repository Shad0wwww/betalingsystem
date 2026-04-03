
import Link from 'next/link';
import { Anchor } from 'lucide-react';
import StatsSection from '../stats/StatsSection';
import ScrollButton from './ScroollButton';
import FAQ from './FAQ';
import HowToPay from './HowToPay';
import { getStats } from './stats';

import './landing.css';
import EstimatedCost from './EstimatedCost';

export default async function LandingPage(
    { dict }: { dict: any }
) {
    const stats = await getStats();
    return (
        <main>
            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="hero-section relative overflow-hidden">
       
                <div className="hero-grid" aria-hidden="true" />

    
                <div className="blurBlob blurBlob--center" aria-hidden="true" />
                <div className="blurBlob blurBlob--left"   aria-hidden="true" />
                <div className="blurBlob blurBlob--right"  aria-hidden="true" />

                <div className="relative z-10 mx-auto max-w-screen-xl sm:px-10 px-5 py-10 pt-24 sm:pt-40 mb-16 sm:mb-40">
                    <div className="flex flex-col justify-center items-center">

                
                        <div className="hero-badge mb-8">
                            <span className="hero-badge__dot" />
                            <Anchor className="w-3 h-3 opacity-70" />
                            {dict.landingpage.badge}
                        </div>

                        <div className="hero-content text-center max-w-5xl flex flex-col justify-center items-center">
                            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.08] tracking-tight">
                                <span className="hero-gradient-text">Ribe</span> Sejlklub
                            </h1>
                            <p className="font-medium mt-8 text-lg max-w-2xl text-gray-400 leading-relaxed">
                                {dict.landingpage.undertitel}
                            </p>
                        </div>

                        <div className="flex sm:flex-row flex-col justify-center items-center mt-10 gap-3 sm:gap-4 w-full sm:w-auto">
                            <ScrollButton label={dict.landingpage.learnmore} />
                            <Link
                                href="/signup"
                                className="w-full sm:w-auto sm:max-w-[182px] whitespace-nowrap text-base font-sans px-5 py-2 duration-150 rounded-lg text-white shadow-2xl cursor-pointer text-center bg-[#262B31] hover:bg-[#363d45] border border-white/5"
                            >
                                {dict.landingpage.signup}
                            </Link>
                        </div>

                        <StatsSection stats={[
                            { value: stats.emptySpaces.toString(), label: dict.landingpage.stats1 },
                            { value: `${stats.elPrices.prisLigenu.pris.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: dict.landingpage.stats2 },
                            { value: stats.users.toString(), label: dict.landingpage.stats3 },
                        ]} />

                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="scroll-indicator" aria-hidden="true">
                    <div className="scroll-indicator__mouse">
                        <div className="scroll-indicator__wheel" />
                    </div>
                    <span className="scroll-indicator__label">Scroll</span>
                </div>

            </section>

            <div id="more">
                <EstimatedCost dict={dict} />
            </div>

            <div>
                <HowToPay dict={dict} />
            </div>

            <div>
                <FAQ dict={dict} />
            </div>
        </main>
    );
}