import { configureStore } from '@reduxjs/toolkit'
import Demo1Slice from './Demo1Slice'
export default configureStore({
    reducer: {
        Demo1: Demo1Slice.reducer
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: false,
    }),
})