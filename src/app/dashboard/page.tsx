'use client';

import GridContainer from "@/components/utils/GridContainer";
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
		<GridContainer>
			<button
				className="px-4 py-2 bg-blue-500 text-white rounded"
				onClick={() => getStripePaymentLink().then((url) => window.location.href = url)}
			>
				Pay with Stripe
			</button>
		</GridContainer>
	);
}
