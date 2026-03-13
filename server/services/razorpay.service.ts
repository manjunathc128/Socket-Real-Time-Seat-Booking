/// <reference types="node" />


import Razorpay from 'razorpay';
import crypto from 'crypto';


// declare const process: NodeJS.Process

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export class RazorpayService {
    static async createOrder(amount: number, bookingReference: string){
        try{
            const options = {
                amount: Math.round(amount * 100), 
                currency: 'INR',
                receipt: bookingReference,
                notes: {
                    booking_reference: bookingReference,
                    created_at: new Date().toISOString()
                }
            }
            const order = await razorpay.orders.create(options);
            return {
                success: true,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            }

        }catch(error: any){
            console.error('Razorpay order creation failed:', error);
            return {
                success: false,
                error: error.message
            }
        }
    } 

    static verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
        try{
            const body = orderId + '|' + paymentId;
            const expectedSignature = crypto
                                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
                                .update(body.toString())
                                .digest('hex');
            return expectedSignature === signature;                    
        }catch(error){
           console.error('Signature verification failed:', error);
           return false; 
        }
    }
    static async getPaymentDetails(paymentId: string){
        try{
            const payment = await razorpay.payments.fetch(paymentId);
            return  {
                success: true,
                payment: {
                    id: payment.id,
                    amount: payment.amount,
                    status: payment.status,
                    method: payment.method,
                    captured: payment.captured,
                    currency: payment.currency,
                    created_at: payment.created_at
                }
            }
        }catch(error: any){
            console.error('Payment details fetching failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async processRefund(paymentId: string, amount?: number){
        try{
            const refundData: any = { payment_id: paymentId};
            if(amount) {
                refundData.amount = Math.round(amount * 100)
            }
            const refund = await razorpay.payments.refund(paymentId, refundData);
            return {
                success: true,
                refund : {
                    id: refund.id,
                    amount: refund.amount,
                    status: refund.status
                }
            }
        }catch(error: any){
            console.error('Refund failed:', error);
            return {
                success: false,
                error: error.message
            };            
        }
    }

    static verifyWebhookSignature(body: string, signature: string): boolean {
        try {
            // Skip webhook verification if secret not configured
            if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
                console.log('Webhook secret not configured, skipping verification');
                return true; // Allow for development
            }

            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
                .update(body)
                .digest('hex');

            return expectedSignature === signature;
        } catch (error) {
            console.error('Webhook signature verification failed:', error);
            return false;
        }
    }
}