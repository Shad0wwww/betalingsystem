
import LandingPage from "@/components/landingpage/Landingpage";
import { getDictionary } from "./dictionaries";
import { notFound } from "next/dist/client/components/navigation";
import { Suspense } from "react";

type PageParams = Promise<{ lang: string }>;

export default async function Page(
	{ params }: { params: PageParams }
) {

	const { lang } = await params;
	const dict = await getDictionary(lang);

	if (!dict) notFound();

	return (
		
		<main>
			<Suspense fallback={<div>Loading...</div>}>
				<LandingPage dict={dict} />
			</Suspense>
		</main>
	);
}
