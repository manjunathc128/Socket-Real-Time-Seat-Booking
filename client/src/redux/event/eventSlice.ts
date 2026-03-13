import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { eventService } from "@/services/event/eventService";



interface iniitialState {
    loading: boolean;
    events: EventResponse | null;
    event: EventById | null;
    recommendedEvents: Event[];
    error: null | string;
}

export interface EventResponse {
    success: boolean;
    data: Event[];
    message: string;
}

export interface RecEventResponse {
    success: boolean;
    data: Event[];
}

export interface Event {
    id: number;
    title: string;
    description?: string;
    venue_id: number;
    event_date: Date;
    price: number;
    poster_image: string;
    total_seats: number;
    available_seats: number;
    status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
    created_at: Date;
    updated_at: Date;
}

export interface EventById {
    success: boolean;
    data: Event;
    message: string;
} 



const initialState: iniitialState = {
        loading: false,
        events: null,
        event: null,
        recommendedEvents: [],
        error: null,

}

export const fetchEvents = createAsyncThunk(
    'event/fetchEvents',
    async (_, thunkAPI) => {
        try{
            const response = await eventService.getEventList()
            return response
        }catch(err: any){
            console.log(err, 'on fetch events')
            const errorRes = err.response.data.error
            return thunkAPI.rejectWithValue(errorRes)
        }
    }

)

export const fetchEventById = createAsyncThunk<
    EventResponse,
    number,
    {rejectValue: string}
>(  
    'event/fetchEventById',
    async (id, thunkAPI) => {
        try{
            const response = await eventService.getEventById(id)
            return response
        }catch(err: any){
            const errorRes = err.response.data.error
            return thunkAPI.rejectWithValue(errorRes)
        }
    }    
)

export const fetchRecommendedEvents = createAsyncThunk<
    RecEventResponse,
    number,
    {rejectValue: string}
    >(
    'event/fetchRecommendedEvents',
    async (limit, thunkAPI) => {
        try{
            const res = await eventService.getRecommended(limit);
            return res.data;
        }catch(err: any){
            return thunkAPI.rejectWithValue(err.response.data.error)
        }    
    }
);

export const fetchEventsById = createAsyncThunk<
    EventResponse, 
    {id: number, offset?: number, limit?: number},
    {rejectValue: string}
>
(
    'event/fetchEventsById',
    async (param, thunkAPI) => {
        try{
            const response = await eventService.getEventListById(param)
            return response
        }catch(err: any){
            const errorRes = err.response.data.error
            return thunkAPI.rejectWithValue(errorRes)
        }
    }
)



const eventSlice = createSlice({
    name: 'event',
    initialState: initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchEvents.pending, (state, action) => {
            state.loading = true
            state.events = []
        })
        .addCase(fetchEvents.fulfilled, (state, action) => {
            state.loading = false
            state.events = action.payload.data
        })
        .addCase(fetchEvents.rejected, (state, action) => {
            state.loading = false
            state.events = []
        })
        .addCase(fetchEventById.pending, (state, action) => {
            state.loading = true
        })
        .addCase(fetchEventById.fulfilled, (state, action) => {
            state.loading = false
            state.event = action.payload
        })
        .addCase(fetchEventById.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload || 'error'
        })
        .addCase(fetchEventsById.pending, (state, action) => {
            state.loading = true
        })
        .addCase(fetchEventsById.fulfilled, (state, action) => {
            state.loading = false
            state.events = action.payload
        })
        .addCase(fetchEventsById.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload || 'error'
        })
         .addCase(fetchRecommendedEvents.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchRecommendedEvents.fulfilled, (state, action) => {
            state.recommendedEvents = action.payload;
            state.loading = false;
        })
        .addCase(fetchRecommendedEvents.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Failed to fetch recommended events';
        })
    }

})

export default eventSlice.reducer
