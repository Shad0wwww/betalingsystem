'use client';


import { SettingsCard } from "@/components/dashboard/SettingsCard";
import { SkeletonCard } from "@/components/utils/SkeletonCard";
import { useEffect, useState } from "react";

/* async function getStripePaymentLink(
	amount = 5000,
	description = "Test Payment"
) {
	return fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/create`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			amount,
			description,
			type: UtilityType.WATER,
		}),
	}).then((res) => res.json())
		.then((data) => data.url)
} */

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
	<input
		{...props}
		className={`w-full border rounded-md p-2 border-[#292828] bg-[#111111] text-white focus:outline-none focus:ring-1 focus:ring-gray-500 ${props.className}`}
	/>
);

async function fetchUserFullName() {
	return fetch(`/api/user/me`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	}).then((res) => res.json()).then((data) => data);
}

async function updateUserFullName(name: string) {
	return fetch(`/api/user/update-name`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name }),
	}).then((res) => res.json()).then((data) => data);
}


export default function Page() {
	const [name, setName] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [email, setEmail] = useState<string>("");

	useEffect(() => {
		fetchUserFullName().then((data) => {
			setName(data.name);
			setEmail(data.email);
			setLoading(false);
		}).catch(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="max-w-3xl mx-auto mt-10">
				<SkeletonCard noBorderBottom={true} />
				<div className="border border-[#252424] rounded-b-lg overflow-hidden">
					<SkeletonCard />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen px-4">

			<div className="flex flex-col max-w-3xl mx-auto mt-2 gap-10">
				<SettingsCard
					title="Change Full Name"
					description="Update your full name to keep your account information accurate."
					buttonText="Save Changes"
					onAction={() => updateUserFullName(name)}
				>
					<Input
						type="text"
						placeholder={name || "Your full name"}
					/>
				</SettingsCard>

				<SettingsCard
					title="Change Email"
					description="Update your email address to keep your account information accurate."
					buttonText="Save Changes"
					onAction={() => console.log("Changing email...")}
				>
					<Input
						type="text"
						placeholder={email || "Your email address"}
					/>

				</SettingsCard>

				<SettingsCard
					title="Delete Account"
					description="Are you sure you want to delete your account? This action cannot be undone."
					buttonText="Delete Account"
					onAction={() => console.log("Deleting account...")}
					variant="danger"
				/>
			</div>

		</div>
	);
}
