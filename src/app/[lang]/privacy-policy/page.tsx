import { getDictionary } from "../dictionaries";

type PageParams = Promise<{ lang: string }>;

const PolicySection = (
    { title, content }: { title: string; content: string }
) => (
    <>
        <hr className="border-zinc-800/50" />
        <section>
            <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
            <p className="leading-relaxed whitespace-pre-line">{content}</p>
        </section>
    </>
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
        <main className="min-h-screen bg-[#0d0d0d] py-20 px-4 text-zinc-300 font-sans">
            <div className="max-w-[900px] mx-auto bg-[#111111] border border-zinc-800/50 rounded-xl p-8 md:p-12 shadow-2xl">

                <header className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {privacypolicy.title}
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Senest opdateret: 22. Februar, 2026
                    </p>
                </header>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {privacypolicy.undertitle}
                        </h2>
                        <div className="space-y-6 leading-relaxed">
                            <p>{privacypolicy.introduction}</p>

                            <address className="not-italic bg-[#171717] p-6 rounded-lg border border-zinc-800/50">
                                <h3 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">
                                    {privacypolicy.publisher.title}
                                </h3>
                                <div className="text-zinc-400 text-sm space-y-1">
                                    <p className="font-semibold text-zinc-300">Ribe Sejlklub ApS</p>
                                    <p>Erik Menvedsvej 20, 6760 Ribe</p>
                                    <p>CVR: 74852513</p>
                                    <p>
                                        Email: <a href="mailto:support@pins.dk" className="hover:text-white transition-colors">support@pins.dk</a>
                                    </p>
                                </div>
                            </address>
                        </div>
                    </section>

                    {sections.map((section, index) => (
                        <PolicySection
                            key={index}
                            title={section.title}
                            content={section.content}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}

export default PrivacyPolicyPage;