import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type NotificationItem = {
    user: {
        _id: string;
        full_name: string;
        profile_picture: string;
    }

    message_type: "text" | "image";
    latest_message: string;
    media_url?: string | null;
    latest_created_at: string | Date;
    unread_count: number;
    is_unread: boolean;
};

type NotificationState = {
    items: NotificationItem[];
};

const initialState: NotificationState = {
    items: []
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
            state.items = action.payload;
        },
        addOrUpdateNotification: (state, action: PayloadAction<NotificationItem>) => {
            const incoming = action.payload;
            const index = state.items.findIndex((n) => n.user._id === incoming.user._id);

            if (index >= 0) {
                state.items[index] = {
                    ...state.items[index],
                    ...incoming,
                    unread_count: state.items[index].unread_count + incoming.unread_count,
                    is_unread: true
                };
                
            } else {
                // Add new notification
                state.items.push(incoming);
            }
        },
        clearNotifications: (state) => {
            state.items = [];
        }
    }
});

export const { setNotifications, addOrUpdateNotification, clearNotifications } = notificationSlice.actions;

export default notificationSlice.reducer

