'use client';

import getStripe from "@/lib/stripe/Stripe";
import {
    useStripe,
    useElements,
    PaymentElement,
    Elements,
} from "@stripe/react-stripe-js";
import { useState } from "react";

const CheckoutPage = ({ amount }: { amount: number }) => {

    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(false);

    return (
        <h1>Checkout Page</h1>
    )
};

export default CheckoutPage;