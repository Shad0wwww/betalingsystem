// src/app/[lang]/dashboard/settings/page.tsx
import { notFound } from "next/navigation";
import { getDictionary } from "../../dictionaries";
import SettingsClient from "@/components/settings/SettingsPage";

type PageParams = Promise<{ lang: string }>;

export default async function Page({ params }: { params: PageParams }) {
    const { lang } = await params;

    const dict = await getDictionary(lang);

    if (!dict) notFound();

    return <SettingsClient dict={dict} />;
}