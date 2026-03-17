
import DashboardNavbarWrapper from "@/components/navbar/dashboard/DashboardNavbarWrapper";
import { Inter } from "next/font/google";
import { getDictionary } from "../dictionaries";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import Logo from "@/../public/Logo.svg";
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: {
        default: "Ribe Sejlklub — Dashboard",
        template: "%s | Ribe Sejlklub",
    },
    description: "Ribe Sejlklubs skole projekt betalingsportal til Kammerslusen. Book, betal og administrér din bådplads hurtigt og sikkert. (VIGTIGT IKKE DEN RIGTIGE HJEMMESIDE SKOLE PROJEKT)",
    keywords: [
        "Ribe Sejlklub", "Kammerslusen Ribe", "bådplads betaling",
        "sejlklub portal", "Ribe havn", "el til båd", "marina Ribe",
    ],
    authors: [{ name: "Ribe Sejlklub", url: "https://pins.dk" }],
    creator: "Ribe Sejlklub",
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: "Ribe Sejlklub — Dashboard",
        description: "Ribe Sejlklubs skole projekt betalingsportal til Kammerslusen. Book, betal og administrér din bådplads hurtigt og sikkert. (VIGTIGT IKKE DEN RIGTIGE HJEMMESIDE SKOLE PROJEKT)",
        url: "https://pins.dk",
        siteName: "Ribe Sejlklub",
        images: [
            {
                url: Logo.src,
                width: 1200,
                height: 630,
                alt: "Ribe Sejlklub — Dashboard",
            },
        ],
        locale: "da_DK",
        type: "website",
    },
};

type LayoutProps = Readonly<{
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}>;

export default async function DashboardLayout({
    children,
    params,
}: LayoutProps) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <section className={`${inter.className} relative min-h-screen bg-[#0d0d0d]`}>
            {/* Subtle grid — matches landing page */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />
            <div className="relative z-10">
                <DashboardNavbarWrapper params={{ lang, dict }} />
                {children}
            </div>
        </section>
    );
}
