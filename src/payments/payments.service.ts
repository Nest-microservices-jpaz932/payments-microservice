import { Inject, Injectable } from '@nestjs/common';
import { envs } from 'src/config/envs';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payments.dto';
import { Request, Response } from 'express';
import { NATS_SERVICE } from 'src/config/services';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.stripe_secret_key);

    constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

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

        return {
            cancel_url: session.cancel_url,
            success_url: session.success_url,
            url: session.url,
        };
    }

    stripeWebhook(req: Request, res: Response) {
        const signature = req.headers['stripe-signature'] as string;
        let event: Stripe.Event;
        const endpointSecret = envs.stripe_endpoint_secret;

        try {
            event = this.stripe.webhooks.constructEvent(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                req['rawBody'],
                signature,
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
                // eslint-disable-next-line no-case-declarations
                const chargeSucceeded = event.data.object;
                // eslint-disable-next-line no-case-declarations
                const payload = {
                    stripePaymentId: chargeSucceeded.id,
                    orderId: chargeSucceeded.metadata.orderId,
                    receiptUrl: chargeSucceeded.receipt_url,
                };

                this.client.emit('payment.succeeded', payload);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
                break;
        }

        return res.status(200).json({ signature });
    }
}
