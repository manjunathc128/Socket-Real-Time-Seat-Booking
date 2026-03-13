import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookingService } from "@/services/booking/bookingService";

export const createBooking = createAsyncThunk(
    'booking/create',
    async (data: { eventId: number; seatId: number; quantity: number }, thunkAPI) => {
        try {
            const res = await bookingService.createBooking(data);
            return res;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to create booking');
        }
    }
);

const bookingSlice = createSlice({
    name: 'booking',
    initialState: {},
    reducers: {}
});

export default bookingSlice.reducer;