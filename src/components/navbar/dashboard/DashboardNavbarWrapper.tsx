

import DashboardNavbar from "./DashboardNavbar";

export default function DashboardNavbarWrapper({
    params,
}: {
    params: { lang: string };
}) {
    return <DashboardNavbar params={params} />;
}