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

interface MessagesPayload {
    to_user_id: string;
    token: string | null;
}

interface MessageState {
    messages: MessageData[];
    loading: boolean;
}

interface AddMessagePayload {
    messageData: FormData;
    token: string | null;
}

const initialState: MessageState = {
    messages: [],
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
    }
})

export const { setMessages, addMessagePayload, resetMessages } = messageSlice.actions;

export default messageSlice.reducer;