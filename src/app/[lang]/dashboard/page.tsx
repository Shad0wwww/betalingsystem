import GridContainer from "@/components/dashboard/GridContainer";
import { notFound } from "next/dist/client/components/navigation";
import { getDictionary } from "../dictionaries";
import Overview from "@/components/dashboard/Overview";



type PageParams = Promise<{ lang: string }>;

export default async function Page(
    { params }: { params: PageParams }
) {

    const { lang } = await params;
    const dict = await getDictionary(lang);

    if (!dict) notFound();
    return (
        <Overview dict={dict} />
    );
}