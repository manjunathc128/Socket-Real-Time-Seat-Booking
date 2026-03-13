import { combineReducers } from "@reduxjs/toolkit";
import authReducer  from "./auth/authSlice";
import venueReducer from "./venues/venueSlice";
import eventReducer from "./event/eventSlice";
import seatReducer from "./seats/seatSlice";
import bookingReducer from "./booking/bookingSlice";
import movieReducer from "./movies/movieSlice";

const rootReducer = combineReducers({
    auth: authReducer,
    venue: venueReducer,
    event: eventReducer,
    seat: seatReducer,
    booking: bookingReducer,
    movies: movieReducer,
})

export default rootReducer