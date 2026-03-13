import api from "../axiosService";

export interface RecEventResponse {
    success: boolean;
    data: Event[];
}

export const eventService = {
    getEventList : () => api.get('/api/events'),
    getEventById: (id: number) => api.get(`/api/events/${id}`),
    getEventListById: (params: {id: number, offset?: number, limit?: number} ) => api.get('/api/events/venue', {params: params}),
    getRecommended : (limit: number) : Promise<RecEventResponse>  => api.get(`api/events/recommended/${limit}`)   
}