'use client';

import { usePathname } from "next/navigation";
import DashboardNavbar from "./DashboardNavbar";

export default function DashboardNavbarWrapper({
    params,
}: {
    params: { lang: string };
}) {
    const pathname = usePathname();

    return (
        <DashboardNavbar
            params={params}
        />
    );
}