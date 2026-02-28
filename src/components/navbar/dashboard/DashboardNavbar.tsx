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
        <div className="mx-auto container lg:max-w-7xl max-w-screen-xl px-4 md:px-20 pb-10 overflow-x-auto no-scrollbar">
            <NavLinks links={links} />
            <div className="w-full border-[#252424] border-t-[1px] mt-1"></div>
        </div>
    );
}