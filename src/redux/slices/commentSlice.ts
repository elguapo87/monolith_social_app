import api from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

interface Comment {
    _id: string;
    post_id: string;
    user_id: string;
    text: string;
    createdAt: string;
};

interface CommentState {
    comments: Comment[];
    loading: boolean;
}

interface CommentPayload {
    text: string;
    post_id: string;
    token: string | null;
};

const initialState: CommentState = {
    comments: [],
    loading: false
};

export const addComment = createAsyncThunk("comment/addComment", async ({ text, post_id, token }: CommentPayload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/comment/addComment", { text, post_id }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            return rejectWithValue("Failed to send comment");
        }

        return data.comment;

    } catch (error) {
        toast.error("Failed to send comment");
        return rejectWithValue("Failed to send comment");
    }
});

const commentSlice = createSlice({
    name: "comments",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addComment.pending, (state) => {
                state.loading = true
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.loading = false;
                state.comments.unshift(action.payload);
                
            })
            .addCase(addComment.rejected, (state, action) => {
                state.loading = true;
                toast.error((action.payload as string) || "Failed to send comment");
            })
    }
});

export default commentSlice.reducer;