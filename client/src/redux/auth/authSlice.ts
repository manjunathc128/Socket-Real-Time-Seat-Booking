import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";
import { authService } from "@/services/auth/authService";

export const login  =  createAsyncThunk<
    { username: string; token: string, email: string, full_name: string, phone_number: string},
    { username: string; password: string },
    { rejectValue: string }
>(
    'auth/login', 
    async (loginData, thunkAPI) => {
        try{
           const response = await authService.loginService(loginData)
           console.log(response, 'rsss')
           return response
           
        }catch(err: any){
            console.log(err, 'on login thunk')
             const errorRes = err.response.data.error
             return thunkAPI.rejectWithValue((errorRes))
        } 
    } 
)

export interface User {
    id: number;
    username: string;
}

export const signup = createAsyncThunk<
     {success: boolean, message: string, user: User, token: string },
     {username: string; password: string },
     {rejectValue: string}
    >(
    'auth/signup',
    async (signupData, thunkAPI) => {
        try{
           const res =  await authService.registerService(signupData);
           return res
        }catch(err: any){
           const errorRes = err.response.data.error
           return thunkAPI.rejectWithValue(errorRes)
        }
    }
)

export const logout = createAsyncThunk<string, void, {rejectValue: string}>(
    'auth/logout',
    async (_, thunkAPI) => {
        try{
           const res = await authService.logoutService()
            return res
        }catch(err: any){
            const errorRes = err.response.data.error
            return thunkAPI.rejectWithValue(errorRes)
        }
    }
)

interface AuthState {
    username: string | null,
    token: string | null,
    email: string | null,
    fullName: string | null,
    phoneNumber: string | null
    error: string | null,
    loading: boolean,
    isAuthenticated: boolean
}

const initialState: AuthState = {
    username: null,
    token: null,
    email: null,
    fullName: null,
    phoneNumber: null,
    error: null,
    loading: false,
    isAuthenticated: false
}


const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setUser: (state, action) => {
            state.username = "j"
        },
        clearErrorLoading: (state) => {
            state.error = null;
            state.loading = false;
        },
        clearAuthData: (state) => {
            state.username = null;
            state.token = null;
            state.email = null;
            state.fullName = null;
            state.phoneNumber = null;
            state.error = null;
            state.loading = false;
        }

    },
    extraReducers: (builder) => {
        builder
        // .addCase(REHYDRATE, (state, action) => {
        //    const persistedAuth =  (action.payload as any).auth
        //    if(persistedAuth) {
        //     state.username = persistedAuth.username
        //     state.token = persistedAuth.token
        //     state.email = persistedAuth.email
        //     state.fullName = persistedAuth.fullName
        //     state.phoneNumber = persistedAuth.phoneNumber
        //    } 
        //    state.error = null
        //    state.loading = false
        // })
        .addCase(login.pending, (state, action) => {
            state.error = null;
            state.loading = true;

        } )
        .addCase(login.fulfilled, (state, action) => {
            console.log(action.payload, 'on login fulfilled')
            state.username = action.payload.username;
            state.token = action.payload.token
            state.email = action.payload.email
            state.fullName = action.payload.full_name
            state.phoneNumber = action.payload.phone_number
            state.loading = false;
            state.error = null
            state.isAuthenticated = true

        })
        .addCase(login.rejected, (state, action) => {
            state.error = action.payload || 'Login failed';
            state.loading = false;
            state.isAuthenticated = false;
        })
        .addCase(signup.pending, (state, action) => {
            state.error = null;
            state.loading = true;
        })
        .addCase(signup.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
            state.username = action.payload.user.username;
            state.token = action.payload.token;
        })
        .addCase(signup.rejected, (state, action) => {
            state.error = action.payload || 'Signup failed';
            state.loading = false;
        })
        .addCase(logout.fulfilled, (state, action) => {
            state.username = null;
            state.token = null;
            state.email = null;
            state.fullName = null;
            state.phoneNumber = null;
            state.error = null;
            state.loading = false;
        })
    }
})

export const { clearErrorLoading, clearAuthData, setUser} = authSlice.actions
export default authSlice.reducer
