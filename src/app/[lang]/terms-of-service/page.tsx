import { getDictionary } from "../dictionaries";


type PageParams = Promise<{ lang: string }>;

async function Page({
    params
}: {
    params: PageParams;
}) {

    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <main className="min-h-screen bg-[#050505] py-20 px-4 text-zinc-300 font-sans">
            
            <div className="max-w-[900px] mx-auto bg-[#0a0a0a] border border-zinc-800/50 rounded-xl p-8 md:p-12 shadow-2xl">
                <header className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {dict.termsofservice.title}
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Senest opdateret: 25. januar, 2026
                    </p>
                </header>

                <div className="space-y-12">
                    
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {dict.termsofservice.undertitle}
                        </h2>
                        <div className="space-y-4 leading-relaxed">
                            <p>
                                {dict.termsofservice.introduction}
                            </p>
                            
                            <div className="mt-6">
                                <h3 className="text-white font-medium mb-2 text-sm uppercase tracking-wider">{dict.termsofservice.publisher.title}</h3>
                                <div className="text-zinc-400 text-sm space-y-1 not-italic">
                                    <p>Ribe Sejlkub ApS</p>
                                    <p>Erik Menvedsvej 20, 6760 Ribe</p>
                                    <p>CVR: 74852513</p>
                                    <p>Email: support@pins.dk</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-zinc-800/50" />

                    {/* §1 Levering */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {dict.termsofservice.section1.title}
                        </h2>
                        <p className="leading-relaxed">
                            {dict.termsofservice.section1.content}
                        </p>
                    </section>
                    <hr className="border-zinc-800/50" />
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {dict.termsofservice.section2.title}
                        </h2>
                        <p className="leading-relaxed">
                            {dict.termsofservice.section2.content}
                        </p>
                    </section>

                    <hr className="border-zinc-800/50" />
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {dict.termsofservice.section3.title}
                        </h2>
                        <p className="leading-relaxed">
                            {dict.termsofservice.section3.content}
                        </p>
                    </section>

                    <hr className="border-zinc-800/50" />
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {dict.termsofservice.section4.title}
                        </h2>
                        <p className="leading-relaxed">
                            {dict.termsofservice.section4.content}
                        </p>
                    </section>

                    <hr className="border-zinc-800/50" />
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {dict.termsofservice.section5.title}
                        </h2>
                        <p className="leading-relaxed">
                            {dict.termsofservice.section5.content}
                        </p>
                    </section>
                    <hr className="border-zinc-800/50" />
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {dict.termsofservice.section6.title}
                        </h2>
                        <p className="leading-relaxed">
                            {dict.termsofservice.section6.content}
                        </p>
                    </section>
                    <hr className="border-zinc-800/50" />
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {dict.termsofservice.section7.title}
                        </h2>
                        <p className="leading-relaxed">
                            {dict.termsofservice.section7.content}
                        </p>
                    </section>

                    <hr className="border-zinc-800/50" />
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {dict.termsofservice.section8.title}
                        </h2>
                        <p className="leading-relaxed">
                            {dict.termsofservice.section8.content}
                        </p>
                    </section>

                    <hr className="border-zinc-800/50" />
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {dict.termsofservice.section9.title}
                        </h2>
                        <p className="leading-relaxed">
                            {dict.termsofservice.section9.content}
                        </p>
                    </section>


                </div>
            </div>
        </main>
    );
}

export default Page;