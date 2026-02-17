

export const fetchCache = "force-no-store";

import Link from "next/link";

//TODO: Oversættelse her
export default async function Footer() {
    const sections = [
        {
            title: "Information",
            links: [
                { name: "Servicevilkår", href: "/terms-of-service" },
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
                                Alle rettigheder forbeholdes.
                            </p>
                        </div>
                        <div>
                            <br />
                            <h1 className="text-sm text-white/50">support@pins.dk</h1>
                            <h1 className="text-sm text-white/50">Ribe Sejlkub ApS</h1>
                            <br />
                            <h1 className="text-sm text-white/50">CVR: 74852513</h1>
                            <h1 className="text-sm text-white/50">Erik Menvedsvej 20,</h1>
                            <h1 className="text-sm text-white/50">6760 Ribe</h1>
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
                Disclaimer: Pins.dk er en betalingsløsning udviklet af Ribe Sejlkub ApS. Alle transaktioner og data håndteres sikkert og i overensstemmelse med gældende lovgivning. For spørgsmål eller support, kontakt os på support@pins.dk
            </div>
        </div>
    );
}