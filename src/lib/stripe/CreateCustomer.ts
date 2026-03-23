import getStripe from "./Stripe";


export async function createStripeCustomer(
    email: string, 
    username: string,
    phone?: string
) {
    return await getStripe().customers.create({
        email,
        name: username,
        phone,
    });
}
