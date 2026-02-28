

import DashboardNavbar from "./DashboardNavbar";

export default function DashboardNavbarWrapper({
    params,
}: {
    params: { lang: string, dict: any };
}) {
    return <DashboardNavbar params={params} />;
}