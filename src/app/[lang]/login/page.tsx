import LandingLoginPage from "@/components/login/landingLoginPage";
import { notFound } from "next/navigation"; // RETTELSE 1: Korrekt import
import { getDictionary } from "../dictionaries";

type PageParams = Promise<{ lang: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page(props: {
    params: PageParams;
    searchParams: SearchParams;
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    console.log("Received params:", params);
    console.log("Received searchParams:", searchParams);

    const lang = params.lang;

    const email = typeof searchParams.email === 'string' ? searchParams.email : undefined;

    const dict = await getDictionary(lang);

    if (!dict) notFound();

    return (
        <div>
            <LandingLoginPage dict={dict} email={email} />
        </div>
    );
}