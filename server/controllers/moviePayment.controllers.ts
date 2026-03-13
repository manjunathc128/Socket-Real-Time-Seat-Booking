import { Request, Response, NextFunction } from 'express';
import { RazorpayService } from '../services/razorpay.service';
import { MovieBookingModel } from '../models/MovieBooking.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const createMoviePaymentOrder = async (req: AuthenticatedRequest, res: Response ) => {
    try{
        const { bookingId } = req.body;
        const userId = req.user.id;
        const booking = await MovieBookingModel.findById(bookingId);

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

        await MovieBookingModel.updatePaymentOrderId(bookingId, orderResult.orderId);

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
        console.error('Create movie payment order error:', err);
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

export const verifyMoviePayment = async (req: AuthenticatedRequest, res: Response) => {
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
                success: false,
                message: 'Invalid payment signature'
            })
        }
        const paymentDetails = await RazorpayService.getPaymentDetails(razorpay_payment_id);

        if(!paymentDetails.success || paymentDetails.payment.status !== 'captured' ){
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            })
        }

        const updateResult = await MovieBookingModel.updatePaymentDetails(bookingId, {
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            payment_status: 'COMPLETED',
            payment_method: paymentDetails.payment.method
        });

        if (!updateResult) {
            return res.status(400).json({
                success: false,
                message: 'Failed to update booking'
            })
        }

        const confirmed = await MovieBookingModel.confirmBooking(bookingId);

        if(!confirmed){
            return res.status(400).json({
                success: false,
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
        console.error('Movie payment verification error:', err);
        return res.status(500).json({
            success: false,
            message: 'Payment verification failed'
        });
    }
}
