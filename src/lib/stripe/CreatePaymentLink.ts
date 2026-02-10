
import { stripeInstance } from "./Stripe";

interface CreatePaymentLinkParams {
    amount: number;
    description: string;
    metadata?: Record<string, number | string>;
}

export async function createPaymentLink(
    createPaymentLinkParams: CreatePaymentLinkParams
) {
    return await stripeInstance.paymentLinks.create({
        line_items: [
            {
                price_data: {
                    currency: "dkk",
                    product_data: {
                        name: createPaymentLinkParams.description,
                    },
                    unit_amount: createPaymentLinkParams.amount,
                },
                quantity: 1,
            },
        ],
        metadata: createPaymentLinkParams.metadata,
    });
}
