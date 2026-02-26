'use client';

import { usePathname } from "next/navigation";
import DashboardNavbarAdmin from "./DashboardNavbarAdmin";


export default function DashboardNavbarWrapperAdmin({
    params,
}: {
    params: { lang: string };
}) {
    const pathname = usePathname();

    return (
        <DashboardNavbarAdmin
            params={params}
        />
    );
}