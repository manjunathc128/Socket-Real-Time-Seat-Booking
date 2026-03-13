import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Grid, Text, UnstyledButton, Stack, Button } from '@mantine/core';
import { IconArmchair, IconLock, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import api from '@/services/axiosService';
import { paymentService } from '@/services/payment/paymentService';
import { useSocket } from '@/context/SocketContext'
import MovieSeatTimer from './MovieSeatTimer';

import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { lockMovieSeat, createMovieBooking } from '@/redux/movies/movieSlice';
import { movieBookingService } from '@/services/movies/movieBooking.service';


interface MovieSeatSelectionProps {
  seats: Record<string, any[]>;
  showId: number;
  showPrice: number;
  onPaymentSuccess: () => void;
}


export interface MovieSeat {
    id: number;
    movie_show_id: number;
    row_number: string;
    seat_number: string;
    status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
    locked_until?: Date;
    locked_by?: number;
}

const MovieSeatSelection = ({ seats, showId, showPrice, onPaymentSuccess }: MovieSeatSelectionProps) => {
  const [localSeatUpdates, setLocalSeatUpdates] = useState<Record<number, { status: string }>>({});
  const socket = useSocket();
  const timersRef = useRef<Record<number, number>>({});
  const dispatch = useDispatch<AppDispatch>();

  const displaySeat = Object.entries(seats).reduce((acc, [row, rowSeats ]) => {
    acc[row] = rowSeats.map(seat => ({
      ...seat, 
      ...localSeatUpdates[seat.id]
    }))
    return acc;
  } , {} as Record<string, MovieSeat[]>)

  useEffect( () => {
    if (!socket) return;
      const handleSocketUpdate = (data: {seatId : number; showId: number; status: string; seat: MovieSeat} ) => {
        if (data.showId === showId) {
          setLocalSeatUpdates(
            prev => ({ 
              ...prev, 
              [data.seatId] : {status: data.status as MovieSeat['status'], locked_until: data.seat?.locked_until}
            })
          )
          if(data.status === 'LOCKED' && data.seat?.locked_until) {
            const remaning = Math.floor(
              (new Date(data.seat.locked_until).getTime() - Date.now()) / 1000)

            if(remaning > 0) {
              timersRef.current[data.seatId] = remaning
            }
          }else {
            delete timersRef.current[data.seatId]
          }
        }
    }

    socket.on('movieSeatStatusChanged', handleSocketUpdate);
    const interval = setInterval( () => {
      Object.keys(timersRef.current).forEach(seatId => {
        const id = parseInt(seatId);
        timersRef.current[id]--;
        if (timersRef.current[id] > 0){
          timersRef.current[id]--;
        }else {

          delete timersRef.current[id]
          setLocalSeatUpdates(prev => {
            const { [id] : _, ...rest} = prev
            return rest;
          })
        }
      })
    } , 1000)

    return () => {
      socket.off('movieSeatStatusChanged', handleSocketUpdate);
      clearInterval(interval);
    }

  }, [socket, showId]  )

    const getSeatColor = useCallback((status: MovieSeat['status']) => {
    switch(status) {
      case 'AVAILABLE': return '#40c057';
      case 'LOCKED': return '#fab005';
      case 'BOOKED': return '#fa5252';
      default: return '#40c057';
    }
  }, []);


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
                const orderResponse = await movieBookingService.createPaymentOrder(bookingId);
                const { orderId, amount, currency, keyId } = orderResponse.data;

                const options = {
                  key: keyId,
                  amount: amount,
                  currency: currency,
                  order_id: orderId,
                  name: 'Movie Booking',
                  description: 'Movie Seat Booking Payment',
                  handler: async (response: any) => {
                    try {
                      await movieBookingService.verifyPayment({
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
                      onPaymentSuccess();
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

  const handleSeatClick = async (seat: MovieSeat) => {
    if (seat.status !== 'AVAILABLE') return;

    setLocalSeatUpdates(prev => ({ ...prev, [seat.id]: { status: 'LOCKED' } }));
    timersRef.current[seat.id] = 300;


  try {
    console.log('Locking seat:', seat.id, showId);
    const lockResponse = await dispatch(lockMovieSeat({ seatId: seat.id, showId })).unwrap();
    console.log('Lock response:', lockResponse);

    console.log('Creating booking...');
    const bookingResponse = await dispatch(createMovieBooking({
      showId,
      seatId: seat.id,
      quantity: 1
    })).unwrap();
    console.log('Booking response:', bookingResponse);

    setLocalSeatUpdates(prev => {
      const { [seat.id]: _, ...rest } = prev;
      return rest;
    });

    openPaymentModal(bookingResponse.data.id, bookingResponse.data.total_amount);
  } catch (error: any) {
  console.error('Full error:', error);
      setLocalSeatUpdates(prev => {
        const { [seat.id]: _, ...rest } = prev;
        return rest;
      });
      delete timersRef.current[seat.id];
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to lock seat',
        color: 'red'
      });
    }
  };

  return (
    <Box>
      {Object.entries(displaySeat).map(([row, rowSeats]) => (
        <Box key={row} mb="lg">
          <Text fw={600} mb="sm" size="sm" c="dimmed">Row {row}</Text>
          <Grid gutter="xs">
            {rowSeats.map((seat) => {
              const hasTimer = timersRef.current[seat.id] > 0;
              
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
                      {seat.status === 'LOCKED' && hasTimer && <MovieSeatTimer seatId={seat.id} timersRef={timersRef} />}
                    </Stack>
                  </UnstyledButton>
                </Grid.Col>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default MovieSeatSelection;
