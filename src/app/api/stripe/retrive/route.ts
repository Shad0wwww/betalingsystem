import 'server-only';
import { NextRequest, NextResponse } from "next/server";
import { stripeInstance } from "@/lib/stripe/Stripe";
import { InvoiceService } from "@/lib/stripe/invoiceService";
import Stripe from "stripe";


export async function POST(req: NextRequest) {
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    // 1. Verificer at eventet rent faktisk kommer fra Stripe
    try {
        event = stripeInstance.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // 2. Håndter eventet via Service Layer
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;
            await InvoiceService.handleCheckoutSuccess(session);
            break;

        default:
            console.log(`Uhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}