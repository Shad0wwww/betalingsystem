

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
            ],
        },
    ];

    return (
        <div className="flex flex-col items-center gap-10 py-12 px-4 xl:px-10 relative">
            <div className="flex flex-col xl:flex-row gap-16 justify-between w-full max-w-screen-xl">
                <div className="flex flex-col justify-between">
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex flex-row items-center xl:items-start justify-between xl:flex-col gap-2">
                            <div className="flex flex-row items-center gap-2">
                                <p className="text-[#888]">© {new Date().getFullYear()}</p>
                            </div>
                            <p className="text-blue-500 text-sm text-right xl:text-left max-w-[110px] sm:max-w-full">
                                {dict.footer.allRightsReserved}
                            </p>
                        </div>
                        <div>
                            <br />
                            <h1 className="text-sm text-white/50">{dict.footer.support}</h1>
                            <h1 className="text-sm text-white/50">{dict.footer.company}</h1>
                            <br />
                            <h1 className="text-sm text-white/50">{dict.footer.cvr}</h1>
                            <h1 className="text-sm text-white/50">{dict.footer.address1}</h1>
                            <h1 className="text-sm text-white/50">{dict.footer.address2}</h1>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 justify-center gap-10 lg:gap-36 my-3">
                    {sections.map((section) => (
                        <div key={section.title} className="flex flex-col gap-2">
                            <h1 className="text-white">{section.title}</h1>
                            <div className="flex flex-col text-[#888] gap-1">
                                {section.links.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="hover:text-stone-300"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="text-sm text-white/50 text-right mb-4 mt-4 lg:ml-auto">
                {dict.footer.disclaimer}
            </div>
        </div>
    );
}



