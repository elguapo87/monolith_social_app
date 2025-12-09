import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import postReducer from "./slices/postSlice";
import connectionReducer from "./slices/connectionSlice"
import messageReducer from "./slices/messageSlice"

export const store = configureStore({
    reducer: {  
        user: userReducer,
        post: postReducer,
        connection: connectionReducer,
        message: messageReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;