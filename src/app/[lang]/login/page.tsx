
import LandingLoginPage from "@/components/login/landingLoginPage";
import { notFound } from "next/dist/client/components/navigation";
import { getDictionary } from "../dictionaries";


type PageParams = Promise<{ lang: string }>;

export default async function Page(
    { params }: { params: PageParams }
) {

    const { lang } = await params;
    const dict = await getDictionary(lang);

    if (!dict) notFound();
    
    return (
        <div>
            <LandingLoginPage dict={dict} />
        </div>
    );    
}