// src/app/[lang]/dashboard/settings/page.tsx
import { notFound } from "next/navigation";
import { getDictionary } from "../../dictionaries";
import SettingsClient from "@/components/settings/SettingsPage";
import { Suspense } from "react";
import LoadingScreen from "@/components/utils/LoadingScreen";

type PageParams = Promise<{ lang: string }>;

export default async function Page(
    { params }: { params: PageParams }
) {
    const { lang } = await params;

    const dict = await getDictionary(lang);

    if (!dict) notFound();

    return (
        <Suspense fallback={<LoadingScreen />}>
            <SettingsClient dict={dict} />
        </Suspense>
    );
}