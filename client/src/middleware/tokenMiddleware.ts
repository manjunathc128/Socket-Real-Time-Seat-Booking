import { Middleware } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist/lib/constants"
import { tokenService } from '@/services/auth/tokenService';

interface typedAction {
    type: string,
    payload: any 
}

export const tokenMiddleware: Middleware = () => (next) => (action) => {
    const typedAction = action as typedAction

    if(typedAction.type == REHYDRATE && typedAction.payload?.auth?.token ){
        tokenService.setToken(typedAction?.payload?.auth?.token)
    }

    if (typedAction.type === 'auth/login/fulfilled' && typedAction.payload.token ){
        tokenService.setToken(typedAction.payload.token)
    }

    if(typedAction.type === 'auth/logout/fulfilled' ){
        tokenService.clearToken()
    }

    return next(action)
}