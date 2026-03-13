import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { seatService } from "@/services/seats/seatService";
import { RootState } from "../store";
export interface Seat {
    id: number;
    event_id: number;
    row_number: string;
    seat_number: string;
    status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
    locked_until?: Date;
    locked_by?: number;
    created_at: Date;
}

interface SeatResponse {
    success: boolean;
    data: Record<string, Seat[]>
    message: string
}

interface LockSeatResponse {
    success: boolean;
    data: Seat;
    message: string;
}

const calculateRemainingSeconds = (lockedUntil? : Date | string) : number => {
    if(!lockedUntil) return 0;
    const expiryTime = new Date(lockedUntil).getTime();
    const now = Date.now();
    const remaining = Math.floor((expiryTime - now) / 1000);
    return remaining > 0 ? remaining : 0;
}

const extractTimersFromSeats = (seatsData: Record<string, Seat[]>): Record<number, number> => {
    const timers: Record<number, number> = {};
    Object.values(seatsData).flat().forEach(seat => {
        if(seat.status === 'LOCKED' && seat.locked_until) {
                const remaining = calculateRemainingSeconds(seat.locked_until);
                if(remaining > 0) {
                    timers[seat.id] = remaining;
                }
            }
    })
    return timers;
}

export const fetchSeatsByEventId =  createAsyncThunk<
    SeatResponse,
    {eventId: number},
    {
        rejectValue: string;
    }
>(
    'seats/fetchSeatsByEventId',
    async(params,thunkAPI) => {
        try{
            const res = await seatService.getSeatsByEventId(params);
            return res
        }catch(err: any){
            const errorRes = err.response.data.error || 'failed to fetch seats'
            return thunkAPI.rejectWithValue(errorRes)
        }
    } 
)

export const lockSeat = createAsyncThunk<
    LockSeatResponse,
    {seatId: number, eventId: number},
    {
        rejectValue: string;
    }
>(
    'seats/lockSeat',
    async ({seatId, eventId}, thunkAPI) => {
        try{
            const res = await seatService.lockSeat({seatId, eventId});
            return res
        }catch(err: any){
            const errorRes = err.response.data.error || 'failed to fetch seats'
            return thunkAPI.rejectWithValue(errorRes)
        }
    }
)

interface initialState{
    seats: null | SeatResponse;
    seatLoading: boolean;
    seatError: null | string;
    lockingSeats: number[];
    timers: Record<number, number>;
}

const initialState: initialState = {
    seats: null,
    seatLoading: false,
    seatError: null,
    lockingSeats: [],
    timers: {}
}


const seatSlice = createSlice({
    name: 'seats',
    initialState: initialState,
    reducers: {
        updateSeatFromSocket: (state, action) => {
            if(state.seats?.data) {
                const seat = action.payload
                const row = seat.row_number
                const seatIndex = state.seats.data[row]?.findIndex(s => s.id === seat.id)
                if(seatIndex !== -1) {
                    state.seats.data[row][seatIndex] = seat
                    if(seat.status === 'LOCKED' && seat.locked_until){
                        const remaining = calculateRemainingSeconds(seat.locked_until);
                        if(remaining > 0) state.timers[seat.id] = remaining;
                        else delete state.timers[seat.id];
                    }else {
                        delete state.timers[seat.id];
                    }
                }
            }
        },
        setTimer: (state, action) => {
            state.timers[action.payload.seatId] = action.payload.seconds
        },
        decrementTimers: (state) => {
            Object.keys(state.timers).forEach(key => {
                const seatId = +key
                if(state.timers[seatId] > 0) {
                    state.timers[seatId] -= 1
                }else {
                    delete state.timers[seatId]
                }
            })
        },
        clearTimer : (state, action) => {
            delete state.timers[action.payload]
        }
    }, 
    extraReducers: (builder) => {
        builder.addCase(fetchSeatsByEventId.pending, (state, action) => {
            state.seatLoading = true
        })
        .addCase(fetchSeatsByEventId.fulfilled, (state, action) => {
            state.seats = action.payload
            state.seatLoading = false
            state.timers = extractTimersFromSeats(action.payload.data);
        })
        .addCase(fetchSeatsByEventId.rejected, (state, action) => {
            state.seatError = action.payload || 'error'
            state.seatLoading = false
        })
        .addCase(lockSeat.pending, (state, action) => {
            state.lockingSeats
        })
        .addCase(lockSeat.fulfilled, (state, action) => {
            if(state.seats?.data){
                const seat = action.payload.data
                const row = seat.row_number
                const seatIndex = state.seats.data[row]?.findIndex(s => s.id === seat.id)
                if(seatIndex !== -1) {

                    state.seats.data[row][seatIndex] = seat
                    if(seat.locked_until){
                        state.timers[seat.id] = calculateRemainingSeconds(seat.locked_until)
                    }
                }
            }
        })
        .addCase(lockSeat.rejected, (state, action) => {
            state.seatError = action.payload || 'error'
        })
    }
})

const seatsData = (state: RootState ) => state.seat.seats?.data;

export const memoseats =  createSelector(
    seatsData,
    (seats) => {
        if(!seats) return null;
        const flatSeats = Object.values(seats).flat();
        return flatSeats;
    }
)

export default seatSlice.reducer;
export const { updateSeatFromSocket, setTimer, decrementTimers, clearTimer } = seatSlice.actions;