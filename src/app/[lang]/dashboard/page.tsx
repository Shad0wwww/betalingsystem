import GridContainer from "@/components/dashboard/GridContainer";
import { notFound } from "next/dist/client/components/navigation";
import { getDictionary } from "../dictionaries";
import Overview from "@/components/dashboard/Overview";
import { Suspense } from "react";
import LoadingScreen from "@/components/utils/LoadingScreen";
import { getCurrentUser } from "@/lib/session/Session";
import prisma from "@/lib/prisma";
import type { UserWarning } from "@prisma/client";

type PageParams = Promise<{ lang: string }>;

export default async function Page(
    { params }: { params: PageParams }
) {

    const { lang } = await params;
    const dict = await getDictionary(lang);

    if (!dict) notFound();

    // Fetch warnings for current user
    let warnings: UserWarning[] = [];
    try {
        const user = await getCurrentUser();
        if (user) {
            warnings = await prisma.userWarning.findMany({
                where: {
                    userId: user.userId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }
    } catch (error) {
        console.error("Error fetching warnings:", error);
    }

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Overview dict={dict} warnings={warnings} />
        </Suspense>

    );
}