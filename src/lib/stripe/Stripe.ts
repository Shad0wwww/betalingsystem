import stripe from "stripe";

const getStripe = (): stripe => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not defined in environment variables.");
    }
    return new stripe(process.env.STRIPE_SECRET_KEY);
};

export default getStripe;