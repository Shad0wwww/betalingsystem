import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/session/Session";
import DashboardNavbarWrapperAdmin from "@/components/navbar/admin/DashboardNavbarAdminWrapper";


export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {

    const { lang } = await params;

    const user = await getCurrentUser();
    if (!user || user.role !== Role.ADMIN) redirect(`/${lang}/login`);

    return (
        <div className="relative min-h-screen bg-[#0d0d0d]">
            {/* Subtle grid — matches landing page */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />
            <div className="relative z-10">
                <DashboardNavbarWrapperAdmin params={{ lang }} />
                {children}
            </div>
        </div>
    );
}