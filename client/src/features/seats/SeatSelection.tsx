import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Grid, Badge, Text, Box, Loader, Center, UnstyledButton, Stack, Button } from "@mantine/core";
import { Seat } from '@/redux/seats/seatSlice';
import { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from '@/context/SocketContext';
import { IconArmchair, IconLock, IconCheck } from "@tabler/icons-react";
import { lockSeat, updateSeatFromSocket, setTimer, decrementTimers, clearTimer, fetchSeatsByEventId } from "@/redux/seats/seatSlice";
import { createBooking } from "@/redux/booking/bookingSlice";
import { notifications } from "@mantine/notifications";
import { modals } from '@mantine/modals';
import { paymentService } from "@/services/payment/paymentService";

const SeatSelection = () => {
   const dispatch = useDispatch<AppDispatch>() 
   const { seats, seatLoading, timers } = useSelector((state: RootState) => state.seat)
   const socket = useSocket()
   const timersRef = useRef<Record<number, number>>({})
   const intervalRef = useRef<NodeJS.Timeout | null>(null)
   const [localSeatUpdates, setLocalSeatUpdates] = useState<Record<number, Partial<Seat>>>({})

   const displaySeats = seats?.data ? 
       Object.entries(seats.data).reduce((acc, [row, rowSeats]) => {
           acc[row] = rowSeats.map(seat => ({
               ...seat,
               ...localSeatUpdates[seat.id]
           }))
           return acc
       }, {} as Record<string, Seat[]>) 
       : {}

    useEffect(() => {
        if(socket) {
            socket.on('seatStatusChanged', (data: {seat: Seat}) => {
                dispatch(updateSeatFromSocket(data.seat))
                setLocalSeatUpdates(prev => {
                    const updated = {...prev}
                    delete updated[data.seat.id]
                    return updated
                })
            })
            return () => { socket.off('seatStatusChanged') }
        }
    }, [socket, dispatch])

   useEffect(() => {
       intervalRef.current = setInterval(() => {
            dispatch(decrementTimers())
       }, 1000)    
       return () => {
            if(intervalRef.current) clearInterval(intervalRef.current)
       }
   }, [dispatch])

   const getSeatColor = useCallback((status: Seat['status']) => {
        switch(status) {
            case 'AVAILABLE': return '#40c057';
            case 'LOCKED': return '#fab005';
            case 'BOOKED': return '#fa5252';
        }
    }, [])

    const openPaymentModal = (bookingId: number, amount: number) => {
        modals.open({
            title: 'Complete Payment',
            centered: true,
            children: (
                <Stack>
                    <Text size="lg" fw={500}>Amount: ₹{amount}</Text>
                    <Text size="sm" c="dimmed">Complete payment to confirm your booking</Text>
                    <Button 
                        fullWidth 
                        onClick={async () => {
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
                                            modals.closeAll();
                                            if(seats?.data) {
                                                const firstSeat = Object.values(seats.data)[0]?.[0];
                                                if(firstSeat) dispatch(fetchSeatsByEventId({eventId: firstSeat.event_id}))
                                            }
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
                                modals.closeAll();
                            } catch (error) {
                                notifications.show({
                                    title: 'Error',
                                    message: 'Failed to initiate payment',
                                    color: 'red'
                                });
                            }
                        }}
                    >
                        Pay Now
                    </Button>
                </Stack>
            ),
        });
    };

    const handleSeatClick = async (seat: Seat) => {
        if(seat.status !== 'AVAILABLE') return

        setLocalSeatUpdates(prev => ({
            ...prev,
            [seat.id]: {status: 'LOCKED' as const}
        }))

        if(!timers[seat.id]) {
            dispatch(setTimer({seatId: seat.id, seconds: 300}))
        }

        try{
            await dispatch(lockSeat({seatId: seat.id, eventId: seat.event_id})).unwrap()

            const bookingResponse = await dispatch(createBooking({
                eventId: seat.event_id,
                seatId: seat.id,
                quantity: 1
            })).unwrap()

            // Clear local update BEFORE opening modal
            setLocalSeatUpdates(prev => {
                const updated = {...prev}
                delete updated[seat.id]
                return updated
            })

            // Open payment modal
            openPaymentModal(bookingResponse.data.id, bookingResponse.data.total_amount)

        }catch(error: any){
            setLocalSeatUpdates(prev => {
                const updated = {...prev}
                delete updated[seat.id]
                return updated
            })
            dispatch(clearTimer(seat.id))
            notifications.show({
                title: 'Error',
                message: error.message || 'Failed to lock seat',
                color: 'red'
            })
        }
    }

   if (seatLoading) return <Center h={300}><Loader /></Center>
   if (Object.keys(displaySeats).length === 0) return <Text>No seats available</Text>

   return (
    <Box>
        {Object.entries(displaySeats).map(([row, rowSeats]) => (
            <Box key={row} mb="lg">
                <Text fw={600} mb="sm" size="sm" c="dimmed">Row {row}</Text>
                <Grid gutter="xs">
                    {rowSeats.map((seat) => {
                        const timer = timers[seat.id]
                        const isMyLock = seat.status === 'LOCKED' && timer
                        return (
                            <Grid.Col key={seat.id} span={{base: 3, sm: 2, md: 1.5}}>
                                <UnstyledButton
                                    onClick={() => handleSeatClick(seat)}
                                    disabled={seat.status !== 'AVAILABLE'}
                                    style={{
                                        width: '100%',
                                        cursor: seat.status === 'AVAILABLE' ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <Stack gap={2} align="center">
                                        {seat.status === 'AVAILABLE' && <IconArmchair size={32} color={getSeatColor(seat.status)} stroke={1.5} />}
                                        {seat.status === 'LOCKED' && <IconLock size={32} color={getSeatColor(seat.status)} stroke={1.5} />}
                                        {seat.status === 'BOOKED' && <IconCheck size={32} color={getSeatColor(seat.status)} stroke={1.5} />}
                                        <Text size="xs" fw={500}>{seat.seat_number}</Text>
                                        {isMyLock && timer && ( 
                                            <Badge size="xs" color="yellow">
                                                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                            </Badge>                                            
                                        )}
                                    </Stack>
                                </UnstyledButton>
                            </Grid.Col>
                        )
                    })}
                </Grid>
            </Box>
        ))}
    </Box>
   )
}

export default SeatSelection
