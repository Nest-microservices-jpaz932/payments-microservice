import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payments.dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post('create-payment-session')
    createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto) {
        return this.paymentsService.createPaymentSession(paymentSessionDto);
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
    stripeWebhook(@Req() req: Request, @Res() res: Response) {
        return this.paymentsService.stripeWebhook(req, res);
    }
}
