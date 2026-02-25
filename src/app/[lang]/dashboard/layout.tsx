import DashboardNavbar from "@/components/navbar/dashboard/DashboardNavbar";
import { Inter } from "next/font/google";
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

    return (
        <section className={inter.className}>
            <DashboardNavbar params={{ lang }} />
            {children}
        </section>
    );
}
