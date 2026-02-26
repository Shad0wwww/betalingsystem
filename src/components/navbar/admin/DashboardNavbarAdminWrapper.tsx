
import DashboardNavbarAdmin from "./DashboardNavbarAdmin";


export default function DashboardNavbarWrapperAdmin({
    params,
}: {
    params: { lang: string };
}) {
    return (
        <DashboardNavbarAdmin
            params={params}
        />
    );
}