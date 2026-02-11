import api from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

interface MessageData {
    _id: string;
    from_user_id: string;
    to_user_id: string;
    text: string;
    message_type: "text" | "image";
    media_url?: string
    seen: boolean
    createdAt: Date | string
    updatedAt: Date | string,
}

interface RecentMessage {
    user: {
        _id: string;
        full_name: string;
        profile_picture: string;
    };
    message_type: string;
    latest_message: string;
    media_url: string;
    latest_created_at: Date;
    unread_count: number;
    is_unread: boolean;
}

interface MessagesPayload {
    to_user_id: string;
    token: string | null;
}

interface MessageState {
    messages: MessageData[];
    recentConversations: RecentMessage[];
    loading: boolean;
}

interface AddMessagePayload {
    messageData: FormData;
    token: string | null;
}

const initialState: MessageState = {
    messages: [],
    recentConversations: [],
    loading: false,
}

export const fetchMessages = createAsyncThunk("message/getMessages", async ({ to_user_id, token }: MessagesPayload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/message/getMessages", { to_user_id }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to fetch messages");
            return rejectWithValue(data.message || "Failed to fetch messages");
        }

        return { messages: data.messages };

    } catch (error) {
        toast.error("Failed fetch messages");;
        return rejectWithValue("Failed fetch messages");
    }
});

export const addMessage = createAsyncThunk("message/addMessage", async (
    { messageData, token }: AddMessagePayload, { rejectWithValue }
) => {
    try {
        const { data } = await api.post("/message/addMessage", messageData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            return rejectWithValue(data.message || "Failed to add message");
        }

        return data.message;

    } catch (error) {
        toast.error("Failed add message");;
        return rejectWithValue("Failed add message");
    }
});

export const getUserRecentMessages = createAsyncThunk("message/getUserRecentMessages", async (
    token: string | null, { rejectWithValue }
) => {
    try {
        const { data } = await api.get("/message/getUserRecentMessages", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            return rejectWithValue(data.message || "Failed to fetch recent messages");
        }

        return data.recent_messages

    } catch (error) {
        toast.error("Failed to fetch recent messages");
        return rejectWithValue("Failed to fetch recent messages");
    }
});

const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessagePayload: (state, action) => {
            state.messages = [...state.messages, action.payload]
        },
        resetMessages: (state) => {
            state.messages = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMessages.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload.messages;
            })
            .addCase(fetchMessages.rejected, (state) => {
                state.loading = false;
            })
            .addCase(addMessage.pending, (state) => {
                state.loading = true;
            })
            .addCase(addMessage.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = [
                    ...state.messages,
                    action.payload
                ];
            })
            .addCase(addMessage.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to add message");
            })
            .addCase(getUserRecentMessages.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserRecentMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.recentConversations = action.payload;
            })
            .addCase(getUserRecentMessages.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to fetch user messages");
            })
    }
})

export const { setMessages, addMessagePayload, resetMessages } = messageSlice.actions;

export default messageSlice.reducer;