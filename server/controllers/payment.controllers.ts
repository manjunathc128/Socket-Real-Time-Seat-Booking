import { Request, Response, NextFunction } from 'express';
import { RazorpayService } from '../services/razorpay.service';
import { BookingModel } from '../models/Booking.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const createPaymentOrder = async (req: AuthenticatedRequest, res: Response ) => {
    try{
        const { bookingId  } = req.body;
        const userId = req.user.id;
        const booking = await BookingModel.findById(bookingId);

        if(!booking || booking.user_id !== userId){
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            })
        }
        if(booking.status !== 'PENDING'){
            return res.status(400).json({
                success: false,
                message: 'Booking is not in PENDING status'
            })
            
        }
        const orderResult = await RazorpayService.createOrder(
            booking.total_amount,
            booking.booking_reference
        )
        if(!orderResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create payment order',
                error: orderResult.error
            })
        }

        await BookingModel.updatePaymentOrderId(bookingId, orderResult.orderId);

        return res.json({
            success: true,
            data: {
                orderId: orderResult.orderId,
                amount: orderResult.amount,
                currency: orderResult.currency,
                keyId: orderResult.keyId,
                bookingId: booking.id,
                bookingReference: booking.booking_reference
            }
        })

    }catch(err: any){
        console.error('Create payment order error:', err);
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

export const verifyPayment = async (req: AuthenticatedRequest, res: Response) => {
        try{
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body
            const userId = req.user.id;

            const isValidSignature = RazorpayService.verifyPaymentSignature(
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            )
            if(!isValidSignature) {
                return res.status(400).json({
                    sucess: false,
                    message: 'Invalid payment signature'
                })
            }
            // get payment details from razorpay
            const paymentDetails =  await RazorpayService.getPaymentDetails(razorpay_payment_id);

            if(!paymentDetails.success || paymentDetails.payment.status !== 'captured' ){
                return res.status(400).json({
                    success: false,
                    message: 'Payment verification failed'
                })
            }

            const updateResult = await BookingModel.updatePaymentDetails(bookingId, {
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
                payment_status: 'COMPLETED',
                payment_method: paymentDetails.payment.method
            })

            if (!updateResult) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to update booking'
                })
            }

            const confirmed =  await BookingModel.confirmBooking(bookingId)

            if(!confirmed){
                return res.status(400).json({
                    sucess: false,
                    message: 'Booking confirmation failed'
                })
            }

            return res.json({
                success: true,
                message: 'Payment verified and booking confirmed',
                data: {
                    paymentId: razorpay_payment_id,
                    bookingId: bookingId,
                    status: 'CONFIRMED'
                }
            })
        }catch(err){
            console.error('Payment verification error:', err);
            return res.status(500).json({
                success: false,
                message: 'Payment verification failed'
            });
        }
    }

export const getPaymentStatus = async (req: AuthenticatedRequest, res: Response) => {
    try{
        const { paymentId } = req.params;

        const paymentDetails = await RazorpayService.getPaymentDetails(paymentId);

        if(!paymentDetails.success){
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            })
        }
        return res.json({
            success: true,
            data: {
                paymentId: paymentDetails.payment.id,
                amount: paymentDetails.payment.amount,
                status: paymentDetails.payment.status,
                method: paymentDetails.payment.method,
                currency: paymentDetails.payment.currency
            }
        })
    }catch(err){
         console.error('Get payment status error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment status'
        });
    }
}    


export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const signature = req.headers['x-razorpay-signature'] as string;
        const body = JSON.stringify(req.body);

        // Verify webhook signature
        const isValid = RazorpayService.verifyWebhookSignature(body, signature);
        
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const event = req.body;

        switch (event.event) {
            case 'payment.captured':
                // Handle successful payment
                console.log('Payment captured:', event.payload.payment.entity.id);
                break;
                
            case 'payment.failed':
                // Handle failed payment
                console.log('Payment failed:', event.payload.payment.entity.id);
                break;
                
            default:
                console.log('Unhandled webhook event:', event.event);
        }

        res.json({ status: 'ok' });

    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};
