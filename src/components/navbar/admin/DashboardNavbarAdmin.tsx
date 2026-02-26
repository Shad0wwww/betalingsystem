"use client";
import Link from "next/link";

import { Role } from "@prisma/client";
import { getCurrentUserIdFromToken } from "@/lib/jwt/Session";
import { use } from "react";

type Props = {
    params: { lang: string };
};

export default async function DashboardNavbarAdmin({
    params,
}: Props) {
    const user = await getCurrentUserIdFromToken();
    const isAdmin = user?.role?.toLowerCase() === Role.ADMIN;

    if (!isAdmin) {
        return null;
    }

    const links = [
        { href: `/${params.lang}/admin/dashboard`, label: "Oversigt" },
        { href: `/${params.lang}/admin/historik`, label: "Historik" },
        { href: `/${params.lang}/admin/settings`, label: "Settings" },
        { href: `/${params.lang}/dashboard`, label: "Tilbage til dashboard" },
    ];


    return (
        <div className="mx-auto container lg:max-w-7xl max-w-screen-xl px-4 md:px-20 pb-10 overflow-x-auto no-scrollbar">
            <div className="flex flex-row pt-1 sub-headline gap-3">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="px-5 py-1 hover:border-b-2 hover:border-white/20"
                    >
                        <div className="pb-1">
                            <p>{link.label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="w-full border-[#252424] border-t-[1px]"></div>
        </div>
    );
}