import { Modal, Button, Text, Stack, Loader, Center } from '@mantine/core';
import { useState, useEffect } from 'react';
import { paymentService } from '@/services/payment/paymentService';
import { notifications } from '@mantine/notifications';

interface PaymentModalProps {
    opened: boolean;
    onClose: () => void;
    bookingId: number;
    amount: number;
    onSuccess: () => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const PaymentModal = ({ opened, onClose, bookingId, amount, onSuccess }: PaymentModalProps) => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const orderResponse = await paymentService.createPaymentOrder(bookingId);
            const { orderId, amount, currency, keyId } = orderResponse.data;

            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                order_id: orderId,
                name: 'Event Booking',
                description: 'Seat Booking Payment',
                handler: async (response: any) => {
                    try {
                        await paymentService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId
                        });
                        notifications.show({
                            title: 'Success',
                            message: 'Payment successful! Booking confirmed.',
                            color: 'green'
                        });
                        onSuccess();
                        onClose();
                    } catch (error) {
                        notifications.show({
                            title: 'Error',
                            message: 'Payment verification failed',
                            color: 'red'
                        });
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        notifications.show({
                            title: 'Cancelled',
                            message: 'Payment cancelled',
                            color: 'yellow'
                        });
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            notifications.show({
                title: 'Error',
                message: 'Failed to initiate payment',
                color: 'red'
            });
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Complete Payment" centered>
            <Stack>
                <Text size="lg" fw={500}>Amount: ₹{amount}</Text>
                <Text size="sm" c="dimmed">Complete payment to confirm your booking</Text>
                {loading ? (
                    <Center><Loader /></Center>
                ) : (
                    <Button onClick={handlePayment} fullWidth>
                        Pay Now
                    </Button>
                )}
            </Stack>
        </Modal>
    );
};

export default PaymentModal;
