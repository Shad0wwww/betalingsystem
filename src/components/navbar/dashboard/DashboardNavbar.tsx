import { getCurrentUserIdFromToken } from "@/lib/jwt/Jwt";
import NavLinks from "./NavLinks";

type Props = {
    params: { lang: string };
};

export default async function DashboardNavbar({ params }: Props) {
    const user = await getCurrentUserIdFromToken();
    const isAdmin = user?.role?.toLowerCase() === "admin";

    const links = [
        { href: `/${params.lang}/dashboard`, label: "Oversigt" },
        { href: `/${params.lang}/dashboard/historik`, label: "Historik" },
        { href: `/${params.lang}/dashboard/settings`, label: "Settings" },
    ];

    if (isAdmin) {
        links.push({
            href: `/${params.lang}/admin/dashboard`,
            label: "Admin",
        });
    }

    return (
        <div className="mx-auto container lg:max-w-7xl max-w-screen-xl px-4 md:px-20 pb-10 overflow-x-auto no-scrollbar">
           
            <NavLinks links={links} />

            <div className="w-full border-[#252424] border-t-[1px] mt-1"></div>
        </div>
    );
}