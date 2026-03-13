import api from "../axiosService";

interface PaymentOrderResponse {
    success: boolean;
    data: {
        orderId : string;
        amount: number;
        currency: string;
        keyId: string;
        bookingId: number;
        bookingReference: string;
    }
}

interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    data: {
        bookingId: number;
        paymentId: string;
        status: string;
    }
}

export const paymentService = {
    createPaymentOrder: (bookingId: number) : Promise<PaymentOrderResponse> => 
        api.post('/api/payments/create-order', { bookingId }),   
    verifyPayment: (data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        bookingId: number;
    }): Promise<VerifyPaymentResponse> => 
        api.post('/api/payments/verify', data)
}