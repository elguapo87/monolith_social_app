import api from "@/lib/axios";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

type NotificationItem = {
    from_user_id: string;
    last_message_date: Date | string;
    last_message_media: string | null;
    last_message_text: string | "";
    unread_count: number;
    user: {
        full_name: string;
        profile_picture: string;
        _id: string;
    };
};

type NotificationState = {
    unread: NotificationItem[];
    loading: boolean;
}

const initialState: NotificationState = {
    unread: [],
    loading: false,
};

export const fetchRecentConversations = createAsyncThunk("message/getUnseenMessages", async (
    token: string | null, { rejectWithValue }
) => {
    try {
        const { data } = await api.get("/message/getUnseenMessages", {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (!data.success) {
            return rejectWithValue(data.message || "Failed to feth unseen messages");
        }

        return data.unread;

    } catch (error) {
        toast.error("Failed to feth unseen messages")
        return rejectWithValue("Failed to feth unseen messages");
    }
});

export const markAsSeen = createAsyncThunk("message/markAsSeen", async (
    { from_user_id, token }: { from_user_id: string, token: string | null },
    { rejectWithValue }
) => {
    try {
        const { data } = await api.post("message/markAsSeen", { from_user_id }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            return rejectWithValue(data.message || "Failed to mark messages as read");
        }

        return { from_user_id };

    } catch (error) {
        rejectWithValue("Failed to mark messages as read");
    }
});

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
            state.unread = action.payload;
        },
        addOrUpdateNotification: (state, action: PayloadAction<NotificationItem>) => {
            const incoming = action.payload;

            const index = state.unread.findIndex((n) => n.from_user_id === incoming.from_user_id);
            if (index >= 0) {
                state.unread[index] = {
                    ...state.unread[index],
                    ...incoming,
                    unread_count: state.unread[index].unread_count + incoming.unread_count
                }
            } else {
                state.unread.push(incoming);
            }
        },
        clearNotifications: (state) => {
            state.unread = [];
        }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchRecentConversations.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchRecentConversations.fulfilled, (state, action) => {
                state.loading = false;
                state.unread = action.payload
            })
            .addCase(fetchRecentConversations.rejected, (state) => {
                state.loading = false;
            })
            .addCase(markAsSeen.pending, (state) => {
                state.loading = true;
            })
            .addCase(markAsSeen.fulfilled, (state, action) => {
                state.loading = false;
                const from_user_id = action.payload?.from_user_id;

                state.unread = state.unread.filter((n) => n.from_user_id !== from_user_id);
            })
            .addCase(markAsSeen.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { setNotifications, addOrUpdateNotification, clearNotifications } = notificationSlice.actions;

export default notificationSlice.reducer

