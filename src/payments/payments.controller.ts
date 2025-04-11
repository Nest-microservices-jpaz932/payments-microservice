import { Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post('create-payment-session')
    createPaymentSession() {
        return 'this.paymentsService.createPayment();';
    }

    @Get('success')
    success() {
        return {
            ok: true,
            message: 'Payment successful',
        };
    }

    @Get('cancel')
    cancel() {
        return {
            ok: true,
            message: 'Payment canceled',
        };
    }

    @Post('webhook')
    stripeWebhook() {
        return {
            ok: true,
            message: 'Webhook received',
        };
    }
}
