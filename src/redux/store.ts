import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import postReducer from "./slices/postSlice";
import connectionReducer from "./slices/connectionSlice"
import messageReducer from "./slices/messageSlice"
import notificationReducer from "./slices/notificationSlice";
import commentReducer from "./slices/commentSlice";

export const store = configureStore({
    reducer: {  
        user: userReducer,
        post: postReducer,
        connection: connectionReducer,
        message: messageReducer,
        notifications: notificationReducer,
        comments: commentReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;