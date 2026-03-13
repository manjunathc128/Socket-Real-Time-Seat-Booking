import api from '../axiosService';

import { VenueResponse } from '@/redux/venues/venueSlice';

export const venueService = {
    // found actual fix   Promise<VenueResponse> api.get<VenueResponse>
    getVenueList : ( params: {offset?: number; limit?: number } ) : Promise<VenueResponse> => api.get<VenueResponse>('/api/venues', {params: params}),
    getRecommended : (params: {limit: number, offset: number} ) => api.get(`/api/venues/recommended`, { params: params }),
    getVenueFilters : () => api.get(`/api/venues/filters`)
}
