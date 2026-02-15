
import DashboardNavbar from "@/components/navbar/dashboard/DashboardNavbar";
import ChooseNavbar from "@/components/navbar/NavbarChoser";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ['latin'] })


export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {


    return (
        <section className={inter.className}>
            <DashboardNavbar />
            {children}
        </section>
    );
}
