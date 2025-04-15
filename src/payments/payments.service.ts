import { Injectable } from '@nestjs/common';
import { envs } from 'src/config/envs';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payments.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.stripe_secret_key);

    async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
        const { currency, items, orderId } = paymentSessionDto;
        const lineItems = items.map((item) => {
            return {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            };
        });

        const session = await this.stripe.checkout.sessions.create({
            mode: 'payment',
            payment_intent_data: {
                metadata: { orderId },
            },
            line_items: lineItems,
            success_url: envs.stripe_success_url,
            cancel_url: envs.stripe_cancel_url,
        });

        return session;
    }

    stripeWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'] as string;
        let event: Stripe.Event;
        const endpointSecret = envs.stripe_endpoint_secret;

        try {
            event = this.stripe.webhooks.constructEvent(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                req['rawBody'],
                sig,
                endpointSecret,
            );
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }
            return res.status(400).send(`Webhook Error: ${String(err)}`);
        }

        switch (event.type) {
            case 'charge.succeeded':
                console.log('Charge succeeded:', event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
                break;
        }
    }
}
