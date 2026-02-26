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
        { href: `/${params.lang}/admin/historik`, label: "Historik" },
        { href: `/${params.lang}/admin/settings`, label: "Settings" },
        { href: `/${params.lang}/dashboard`, label: "Tilbage til dashboard" },
    ];

    return (
        <div className="mx-auto container lg:max-w-7xl max-w-screen-xl px-4 md:px-20 pb-10 overflow-x-auto no-scrollbar">
            <NavLinks links={links} />
            <div className="w-full border-[#252424] border-t-[1px]" />
        </div>
    );
}