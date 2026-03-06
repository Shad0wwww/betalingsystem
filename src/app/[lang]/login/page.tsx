import LandingLoginPage from "@/components/login/landingLoginPage";
import { notFound } from "next/navigation";
import { getDictionary } from "../dictionaries";

type PageParams = Promise<{ lang: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page(props: {
    params: PageParams;
    searchParams: SearchParams;
}) {

    const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
    

    const email = searchParams.email;

    const lang = params.lang;
    const dict = await getDictionary(lang);

    if (!dict) notFound();

    return (
        <div>
            <LandingLoginPage dict={dict} email={email as string || ""} />
        </div>
    );
}