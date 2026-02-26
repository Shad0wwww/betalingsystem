import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUserIdFromToken } from "@/lib/jwt/Session";
import DashboardNavbarWrapperAdmin from "@/components/navbar/admin/DashboardNavbarAdminWrapper";

export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { lang: string };
}) {

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) redirect(`/${params.lang}/login`);
    const { lang } = await params;

    const user = await getCurrentUserIdFromToken(token);
    if (user?.role !== Role.ADMIN) redirect(`/${params.lang}/login`);

    return (
        <>
            <DashboardNavbarWrapperAdmin params={{ lang }} />
            {children}
        </>
    );
}