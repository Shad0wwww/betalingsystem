import { Role } from "@prisma/client";
import { getCurrentUserIdFromToken } from "@/lib/jwt/Session";
import { cookies } from "next/headers";
import NavLinks from "../utils/NavLinks";

type Props = {
    params: { lang: string };
};

export default async function DashboardNavbarAdmin({ params }: Props) {
    const cookieStore = cookies();
    const token = (await cookieStore).get("auth_token")?.value;
    if (!token) return null;

    const user = await getCurrentUserIdFromToken(token);
    if (user?.role !== Role.ADMIN) return null;

    const links = [
        { href: `/${params.lang}/admin/dashboard`, label: "Oversigt" },
        { href: `/${params.lang}/admin/dashboard/stats`, label: "Statistikker" },
        { href: `/${params.lang}/admin/dashboard/logs`, label: "Logs" },
        { href: `/${params.lang}/admin/dashboard/users`, label: "Brugere" },
        { href: `/${params.lang}/admin/dashboard/meters`, label: "Målere" },
        { href: `/${params.lang}/admin/dashboard/sessions`, label: "Aktive sessioner" },
        { href: `/${params.lang}/dashboard`, label: "Tilbage til dashboard" },
    ];

    return (
        <div className="w-full border-b border-white/[0.06] bg-[#0d0d0d]/60 backdrop-blur-sm mb-6">
            <div className="mx-auto max-w-7xl px-4 md:px-20 overflow-x-auto no-scrollbar">
                <NavLinks links={links} />
            </div>
        </div>
    );
}