import api from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

interface Comment {
    _id: string;
    text: string;
    post_id: string;
    user_id: {
        _id: string;
        full_name: string;
        profile_picture: string | "";
    };
    createdAt: string | Date;
};

interface CommentState {
    comments: Comment[];
    commentCount: Record<string, number>;
    loading: boolean;
};

interface CommentPayload {
    post_id: string;
    text: string;
    token: string | null;
}

const initialState: CommentState = {
    comments: [],
    commentCount: {},
    loading: false,
};

export const fetchComments = createAsyncThunk("comment/getComments", async (token: string | null, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/comment/getComments", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            return rejectWithValue(data.message || "Failed to fetch comments");
        }

        return data.comments;

    } catch (error) {
        toast.error("Failed to fetch comments");
        return rejectWithValue("Failed to fetch comments");
    }
});

export const addComment = createAsyncThunk("comment/addComment", async ({ post_id, text, token }: CommentPayload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/comment/addComment", { post_id, text }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            return rejectWithValue(data.message || "Failed to create comment");
        }

        return data.comment;

    } catch (error) {
        toast.error("Failed to create comment");
        return rejectWithValue("Failed to create comment");
    }
});

export const fetchCommentCount = createAsyncThunk<
    { postId: string, count: number },
    { postId: string, token: string | null }
>("comment/countByPosts", async ({ postId, token }, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/comment/countByPosts", { postIds: [postId] }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            return rejectWithValue(data.message);
        }

        return {
            postId,
            count: data.counts[postId] ?? 0
        }

    } catch (error) {
        toast.error("Failed to fetch comment count");
        return rejectWithValue("Failed to fetch comment count");
    }
});

export const deleteComment =
    createAsyncThunk(
        "comment/deleteComment", async ({ commentId, token }: { commentId: string, token: string | null },
            { rejectWithValue }) => {
        try {
            const { data } = await api.post("/comment/deleteComment", { commentId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!data.success) {
                toast.error(data.message);
                return rejectWithValue(data.message);
            }

            return {
                commentId: data.commentId,
                postId: data.postId
            }

        } catch (error) {
            toast.error("Failed to remove comment");
            return rejectWithValue("Failed to remove comment");
        }
    });

const commentSlice = createSlice({
    name: "comments",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchComments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to fetch comments");
            })
            .addCase(addComment.pending, (state) => {
                state.loading = true;
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.loading = false;
                state.comments.unshift(action.payload);

                const postId = action.payload.post_id;
                state.commentCount[postId] = (state.commentCount[postId] ?? 0) + 1;
            })
            .addCase(addComment.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to create comment");
            })
            .addCase(fetchCommentCount.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCommentCount.fulfilled, (state, action) => {
                state.loading = false;
                state.commentCount[action.payload.postId] = action.payload.count;
            })
            .addCase(fetchCommentCount.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to fetch comment count");
            })
            .addCase(deleteComment.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.loading = false;
                
                state.comments = state.comments.filter((c) => c._id !== action.payload.commentId);
                state.commentCount[action.payload.postId] =
                Math.max((state.commentCount[action.payload.postId] ?? 1) - 1, 0);

                toast.success("Comment removed");
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to remove comment");
            })
    }
});

export default commentSlice.reducer;