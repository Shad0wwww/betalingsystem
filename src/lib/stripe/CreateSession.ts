import getStripe from "./Stripe";

export async function createStripeSession(
    customerId: string,
    amount: number,
    description: string,
    userId: string,
    type: string
) {
    return await getStripe().checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        mode: "payment",
        payment_intent_data: { capture_method: "manual" },
        line_items: [{
            price_data: {
                currency: "dkk",
                unit_amount: amount,
                product_data: { name: description },
            },
            quantity: 1,
        }],
        success_url: `${process.env.URL_BASE}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.URL_BASE}/api/stripe/cancel`,
        metadata: { userId, type },
    });
}
