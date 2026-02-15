'use client';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import style from "../navbar.module.css";

export default function DashboardNavbar() {
    const pathname = usePathname();

    return (
        <div className="mx-auto container lg:max-w-7xl max-w-screen-xl px-4 md:px-20 pb-10 overflow-x-auto no-scrollbar">

            <div className="flex flex-row pt-5 sub-headline gap-3">
                <Link
                    href="/dashboard"
                    className={`px-5 py-2 ${pathname === "/dashboard" ? style.active : "hover:border-b-2 hover:border-white/20"}`}
                >
                    <div className="pb-2">
                        <p>Oversigt</p>
                    </div>
                </Link>

                <Link
                    href="/dashboard/historik"
                    className={`px-5 py-2 ${pathname === "/dashboard/historik" ? style.active : "hover:border-b-2 hover:border-white/20"}`}
                >
                    <div className="pb-2">
                        <p>Historik</p>
                    </div>
                </Link>

                <Link
                    href="/dashboard/settings"
                    className={`px-5 py-2 ${pathname === "/dashboard/settings" ? style.active : "hover:border-b-2 hover:border-white/20"}`}
                >
                    <div className="pb-2">
                        <p>Settings</p>
                    </div>
                </Link>
            </div>

            <div className="w-full border-[#252424] border-t-[1px]"></div>

        </div>
    );
}