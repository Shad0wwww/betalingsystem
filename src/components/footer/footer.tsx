

export const fetchCache = "force-no-store";



import { getDictionary } from "@/app/[lang]/dictionaries";
import { notFound } from "next/dist/client/components/navigation.react-server";
import Link from "next/link";
type PageParams = Promise<{ lang: string }>;

export default async function Footer(
    { params }: { params: PageParams }
) {

    const { lang } = await params;
    const dict = await getDictionary(lang);

    if (!dict) notFound();

    const sections = [
        {
            title: dict.footer.information,
            links: [
                { name: dict.footer.termsLink, href: "/terms-of-service" },
                { name: dict.footer.privacyLink, href: "/privacy-policy" },
            ],
        },
    ];

    return (
        <footer className="border-t border-white/[0.06] bg-[#0a0a0a]">
            <div className="mx-auto max-w-screen-xl px-6 xl:px-10 pt-14 pb-8">

                {/* Top row */}
                <div className="flex flex-col xl:flex-row gap-12 xl:gap-0 justify-between">

                    {/* Brand block */}
                    <div className="flex flex-col gap-6 max-w-xs">
                        <div>
                            <p className="text-lg font-bold text-white">
                                <span className="text-blue-500">Ribe</span> Sejlklub
                            </p>
                            <p className="text-blue-500 text-sm mt-1">
                                {dict.footer.allRightsReserved}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-sm text-white/45">{dict.footer.support}</p>
                            <p className="text-sm text-white/45">{dict.footer.company}</p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-sm text-white/45">{dict.footer.cvr}</p>
                            <p className="text-sm text-white/45">{dict.footer.address1}</p>
                            <p className="text-sm text-white/45">{dict.footer.address2}</p>
                        </div>
                    </div>

                    {/* Nav sections */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-24">
                        {sections.map((section) => (
                            <div key={section.title} className="flex flex-col gap-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
                                    {section.title}
                                </p>
                                <div className="flex flex-col gap-2">
                                    {section.links.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className="text-sm text-white/55 hover:text-white transition-colors duration-150"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.06] mt-12 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-xs text-white/30">
                        © {new Date().getFullYear()} Ribe Sejlklub
                    </p>
                    <p className="text-xs text-white/30 sm:text-right max-w-xl">
                        {dict.footer.disclaimer}
                    </p>
                </div>

            </div>
        </footer>
    );
}



