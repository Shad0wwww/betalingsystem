import Stripe from "stripe";
import { stripe } from "./Stripe";


export async function createPaymentLink(
    amount: number, 
    description: string
) {
    return await stripe.paymentLinks.create({
        line_items: [
            {
                price_data: {   
                    currency: "dkk",
                    product_data: {
                        name: description,
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            },
        ],

    })
}
    

