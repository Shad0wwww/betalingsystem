'use client';

import { UtilityType } from "@prisma/client";

async function getStripePaymentLink(
	amount = 5000,
	description = "Test Payment"
) {
	return fetch("/api/stripe/create", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			amount,
			description,
			type: UtilityType.WATER,
		}),
	}).then((res) => res.json())
		.then((data) => data.url)
}

export default function Page() {

	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
				Welcome to Next.js 13!
			</h1>

			<button
				className="mt-6 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				onClick={() => getStripePaymentLink().then((url) => window.open(url, "_blank"))}
			>
				test Payment request
			</button>
		</div>
	);
}
