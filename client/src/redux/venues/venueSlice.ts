import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { venueService } from "@/services/venues/venueService";


export const fetchVenues = createAsyncThunk<
    VenueResponse,
    {limit?: number; offset?: number},
    {
        rejectValue: {error: string; }
    }
>(
    'venues/fetchVenues',
    async ( params, thunkAPI) => {
        try{
            const response = await venueService.getVenueList(params)
            return response.data
        }catch(err: any){
            console.log(err, 'on fetch events')
            const errorRes = err.response.data.error || 'failed'
            return thunkAPI.rejectWithValue(errorRes)
        }
    }
)

export const fetchRecommendedVenues = createAsyncThunk<
    VenueResponse,
    {offset: number; limit: number},
    {
        rejectValue: {error: string; }
    }
>(
    'venues/fetchRecommendedVenues',
    async (params, thunkAPI) => {
        try{
            const response = await venueService.getRecommended(params)
            return response
        }catch(err: any){
            console.log(err, 'on fetch events')
            const errorRes = err.response.data.error || 'failed'
            return thunkAPI.rejectWithValue(errorRes)
        }
    }
)

export const fetchVenueFilters = createAsyncThunk<
    venueFilterRes,
    void,
    {
        rejectValue: {error: string; }
    }
>(
    'venues/fetchVenueFilters',
    async (_, thunkAPI) => {
        try{
            const response = await venueService.getVenueFilters()
            return response
        }catch(err: any){
            console.log(err, 'on fetch events')
            const errorRes = err.response.data.error || 'failed'
            return thunkAPI.rejectWithValue(errorRes)
        }
    }
)

interface iniitialState{
    venues: null | VenueResponse;
    recommendedVenues: [] | VenueResponse;
    venueFilters: [] | venueFilterRes['data'];
    loading: boolean;
    error: null | string;
}


interface venueData {
    venues : venues[]
    total_count: number;
    offset?: number;
    limit?: number;
}

interface venues {
        id: any;
        name: any;
        address: any;
        capacity: any;
        image_name: any;
        description: any;
        created_at: any;
    }

export interface VenueResponse {
    success: boolean;
    data: venueData
    message: string
} 

export interface venueFilterRes {
    data : [
        {
            id: number;
            name: string;
        }
    ]
}

const iniitialState : iniitialState = {
    venues : null,
    recommendedVenues: [],
    venueFilters: [],
    loading: false,
    error: null
}

const venueSlice =  createSlice({
    name: 'venues',
    initialState: iniitialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchVenues.pending, (state, action) => {
            state.venues = null
            state.loading = true
        })
        .addCase(fetchVenues.fulfilled, (state, action) => {
            state.venues = action.payload
            state.loading = false
        })
        .addCase(fetchVenues.rejected, (state, action) => {
            state.error = action.payload?.error || 'Failed to fetch venues'
            state.loading = false
        })
        .addCase(fetchRecommendedVenues.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchRecommendedVenues.fulfilled, (state, action) => {
            state.recommendedVenues = action.payload;
            state.loading = false;
        })
        .addCase(fetchRecommendedVenues.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.error || 'Failed to fetch recommended venues';
        })
        .addCase(fetchVenueFilters.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchVenueFilters.fulfilled, (state, action) => {
            state.loading = false;
            state.venueFilters = action.payload.data;
        })
        .addCase(fetchVenueFilters.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.error || 'Failed to fetch venue filters';
        })
        
    }

})


export default venueSlice.reducer