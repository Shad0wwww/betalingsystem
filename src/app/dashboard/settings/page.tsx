'use client';


import { SettingsCard } from "@/components/utils/SettingsCard";

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



export default function Page() {
	const handleDeleteAccount = () => {
		console.log("Sletter konto...");
	};

	return (
		<div className="min-h-screen px-4">

			<div className="flex flex-col max-w-3xl mx-auto mt-2 gap-10">
				<SettingsCard
					title="Change Full Name"
					description="Update your full name to keep your account information accurate."
					buttonText="Save Changes"
					onAction={() => console.log("Changing full name...")}
				>
					<Input 
						type="text" 
						placeholder="Enter your full name" 
					/>

				</SettingsCard>

				<SettingsCard
					title="Delete Account"
					description="Are you sure you want to delete your account? This action cannot be undone."
					buttonText="Delete Account"
					onAction={handleDeleteAccount}
					variant="danger"
				/>
			</div>

		</div>
	);
}
