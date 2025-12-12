import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type NotificationItem = {
    from_user_id: string;
    last_message_text?: string;
    last_message_media?: string | null;
    unread_count: number;
    user: {
        _id: string;
        full_name: string;
        profile_picture: string;
    };
    last_message_date: string | Date;
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
                // Update unread count + last message
                state.items[index].unread_count += incoming.unread_count;
                state.items[index].last_message_text = incoming.last_message_text;
                state.items[index].last_message_media = incoming.last_message_media;
                state.items[index].last_message_date = incoming.last_message_date;

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

