import DashboardNavbar from "@/components/navbar/dashboard/DashboardNavbar";
import DashboardNavbarWrapper from "@/components/navbar/dashboard/DashboardNavbarWrapper";
import { Inter } from "next/font/google";
import { getDictionary } from "../dictionaries";
const inter = Inter({ subsets: ['latin'] })

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
