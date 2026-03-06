import { cookies } from "next/headers";
import { getCurrentUserIdFromToken } from "@/lib/jwt/Session";
import NavLinks from "../utils/NavLinks";
import { Role } from "@prisma/client";

type Props = {
    params: { lang: string, dict: any };
};

export default async function DashboardNavbar(
    { params }: Props
) {
    const cookieStore = cookies();
    const token = (await cookieStore).get("auth_token")?.value;

    const user = await getCurrentUserIdFromToken(token);

    const isAdmin = user?.role === Role.ADMIN;

    

    const links = [
        { href: `/${params.lang}/dashboard`, label: params.dict.dashboard.navbar.oversigt },
        { href: `/${params.lang}/dashboard/historik`, label: params.dict.dashboard.navbar.historik },
        { href: `/${params.lang}/dashboard/settings`, label: params.dict.dashboard.navbar.settings },
    ];

    if (isAdmin) {
        links.push({
            href: `/${params.lang}/admin/dashboard`,
            label: params.dict.dashboard.navbar.admin,
        });
    }

    return (
        <div className="w-full border-b border-white/[0.06] bg-[#0d0d0d]/60 backdrop-blur-sm mb-6">
            <div className="mx-auto max-w-7xl px-4 md:px-20 overflow-x-auto no-scrollbar">
                <NavLinks links={links} />
            </div>
        </div>
    );
}