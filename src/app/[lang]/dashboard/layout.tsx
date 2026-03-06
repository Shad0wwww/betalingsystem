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
        <section className={`${inter.className}`}>
            <DashboardNavbarWrapper params={{ lang, dict }} />
            {children}
        </section>
    );
}
