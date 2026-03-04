import GridContainer from "@/components/dashboard/GridContainer";
import { notFound } from "next/dist/client/components/navigation";
import { getDictionary } from "../dictionaries";
import Overview from "@/components/dashboard/Overview";
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
            <Overview dict={dict} />
        </Suspense>
        
    );
}