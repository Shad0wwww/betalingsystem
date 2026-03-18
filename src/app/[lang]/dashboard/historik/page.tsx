import { getDictionary } from "../../dictionaries";
import { HistorikClient } from "./HistorikClient";
import { History } from "lucide-react"


type PageParams = Promise<{ lang: string }>;


export default async function Page(
    { params }: { params: PageParams }
) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <div className="min-h-screen pb-12">
            {/* Page header */}
            <div className="mx-auto max-w-screen-xl px-4 md:px-20 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-5 bg-gradient-to-r from-transparent to-blue-500/50" />
                    <span className="text-blue-400 text-[11px] font-semibold uppercase tracking-[0.2em]">
                        {dict.dashboard.navbar.oversigt}
                    </span>
                </div>
                <div className="flex items-center gap-2.5">
                    <History className="w-5 h-5 text-zinc-400" />
                    <h1 className="text-2xl font-bold text-white">{dict.dashboard.historik.title}</h1>
                </div>
                <p className="text-zinc-500 text-sm mt-1">{dict.dashboard.historik.subtitle}</p>
            </div>

            <div className="mx-auto max-w-screen-xl px-4 md:px-20">
                <div className="border rounded-lg custom-box2 py-6 px-7">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-semibold text-white">{dict.dashboard.historik.transaktioner}</h2>
                            <p className="text-zinc-500 text-sm mt-0.5">{dict.dashboard.historik.caption}</p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_6px_2px_rgba(96,165,250,0.5)]" />
                    </div>
                    <HistorikClient dict={dict} />
                </div>
            </div>
        </div>
    )
}
