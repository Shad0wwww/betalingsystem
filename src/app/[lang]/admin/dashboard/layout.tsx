import DashboardNavbarWrapperAdmin from "@/components/navbar/admin/DashboardNavbarAdminWrapper";
import DashboardNavbar from "@/components/navbar/dashboard/DashboardNavbar";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ['latin'] })

type LayoutProps = Readonly<{
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}>;

export default async function AdminDashboardLayout({
    children,
    params,
}: LayoutProps) {
    const { lang } = await params;

    return (
        <section className={inter.className}>
            <DashboardNavbarWrapperAdmin params={{ lang }} />
            {children}
        </section>
    );
}
