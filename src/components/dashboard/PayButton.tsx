import { UtilityType } from "@prisma/client";

async function createPaymentLink(amount: number, description: string, type: UtilityType) {
    return await fetch(`/api/stripe/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ amount, description, type })
    });
}

export default function PayButton(
    { amount, description, type }: { amount: number; description: string; type: UtilityType }
) {

    return (


       <button
            type="button"
            onClick={async () => {
                const res = await createPaymentLink(amount*100, description, type);
                if (res.ok) {
                    const data = await res.json();
                    window.location.href = data.url;
                }
            }}
            className="rounded-lg px-7 py-[7px] min-w-[55.5px] cursor-pointer  bg-blue-500 text-white hover:bg-blue-600 text-xs font-bold transition-colors duration-300"
        >
            Pay {amount} DKK
        </button>
        
    )

}