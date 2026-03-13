import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore, PERSIST, REHYDRATE, REGISTER, FLUSH, PURGE, PAUSE  } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import rootReducer from './rootReducer';
import { tokenMiddleware } from '@/middleware/tokenMiddleware';

const persistConfig = {
    key: 'root',
    storage: storage,
    whitelist: ['auth']
}

const persistedReducer = persistReducer(persistConfig, rootReducer)


export const store = configureStore({
    reducer : persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [ REHYDRATE , PERSIST, REGISTER, FLUSH, PAUSE, PURGE]  // REHYDRATE , PERSIST
        },
    }).concat(tokenMiddleware)

})

export type RootState =   ReturnType< typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const  persistor  = persistStore(store)