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
    
    console.log("DEBUG - Params:", params);
    console.log("DEBUG - SearchParams:", searchParams);

    const email = searchParams.email;

    const lang = params.lang;
    const dict = await getDictionary(lang);

    if (!dict) notFound();

    return (
        <div>
            {/* Vi sender den udtrukne email videre som prop */}
            <LandingLoginPage dict={dict} email={email as string || ""} />
        </div>
    );
}