import api from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

interface PostUser {
    _id: string;
    full_name: string;
    email: string;
    profile_picture?: string;
    user_name?: string;
    bio?: string;
    location?: string;
    cover_photo?: string;
    followers?: string[];
    following?: string[];
    connections?: string[];
    createdAt?: Date;
}

interface Post {
    _id: string;
    user: PostUser;
    content: string;
    image_urls: string[];
    post_type: string;
    likes_count: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

interface PostState {
    posts: Post[];
    loading: boolean;
}

const initialState: PostState = {
    posts: [],
    loading: false
};

export const getPosts = createAsyncThunk("post/getPosts", async (token: string | null, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/post/getPosts", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success) {
            return data.posts;

        } else {
            toast.error(data.message || "Failed to get posts");;
            return rejectWithValue(data.message || "Failed to get posts");
        }

    } catch (error) {
        toast.error("Failed to get posts");
        return rejectWithValue("Failed to get posts");
    }
});

const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(getPosts.fulfilled, (state, action) => {
                state.posts = action.payload;
                state.loading = false;
            })
            .addCase(getPosts.rejected, (state) => {
                state.loading = false;
            })
    }
});

export default postSlice.reducer;
