import api from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

export interface PostUser {
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

export interface Post {
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
    pendingLikeMap: Record<string, boolean>;
    likedPosts: Post[];
}

interface ToggleLikePayload {
    postId: string;
    userId: string;
    token: string | null;
}

const initialState: PostState = {
    posts: [],
    loading: false,
    pendingLikeMap: {},
    likedPosts: [],
};

export const createPost = createAsyncThunk("post/addPost", async (
    { postData, token }: { postData: FormData, token: string | null }, { rejectWithValue }
) => {
    try {
        const { data } = await api.post("/post/addPost", postData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to create post");;
            return rejectWithValue(data.message || "Failed to create post");
        }

        return {
            message: data.message
        };

    } catch (error) {
        toast.error("Failed to create post");
        return rejectWithValue("Failed to create post");
    }
})

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

export const getUserPosts = createAsyncThunk("post/getUserPosts", async (
    { profileId, token }: { profileId: string, token: string | null }, { rejectWithValue }
) => {
    try {
        const { data } = await api.get("/post/getUserPosts", {
            params: { profileId },
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to get user posts");
            return rejectWithValue(data.message || "Failed to get user posts");
        }

        return data.posts as Post[];

    } catch (error) {
        toast.error("Failed to get user posts");
        return rejectWithValue("Failed to get user posts");
    }
});

export const toggleLike = createAsyncThunk("post/toggleLike", async ({ postId, token }: ToggleLikePayload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/post/like", { postId }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to toggle like");
            return rejectWithValue(data.message || "Failed to toggle like");
        }

        return {
            postId,
            message: data.message
        };

    } catch (error) {
        toast.error("Failed to toggle like");
        return rejectWithValue("Failed to toggle like");
    }
});

export const getPostById = createAsyncThunk("post/getPost", async ({ postId, token }: { postId: string, token: string | null }, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/post/getPost", {
            params: { postId },
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to fetch post");
            return rejectWithValue(data.message || "Failed to fetch post");
        }

        return data.post as Post;

    } catch (error) {
        toast.error("Failed to fetch post");
        return rejectWithValue("Failed to fetch post");
    }
});

export const deletePost = createAsyncThunk("post/deletePost", async ({ postId, token }: { postId: string, token: string | null }, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/post/deletePost", { postId }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            return rejectWithValue(data.message || "Failed to delete post");
        }

        return {
            postId,
            message: data.message
        }

    } catch (error) {
        return rejectWithValue("Failed to delete post");
    }
});

export const fetchLikedPosts = createAsyncThunk("post/likedPosts", async (token: string | null, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/post/likedPosts", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            return rejectWithValue(data.message || "Failed to fetch liked posts");
        }

        return data.posts;

    } catch (error) {
        return rejectWithValue("Failed to fetch liked posts");
    }
});

const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {
        clearPosts: (state) => {
            state.posts = [];
            state.loading = false;
            state.pendingLikeMap = {};
            state.likedPosts = [];
        },
        updateUserInPosts: (state, action) => {
            const updatedUser = action.payload;

            state.posts.forEach((post) => {
                if (post.user._id === updatedUser._id) {
                    post.user = {
                        ...post.user,
                        ...updatedUser,
                    };
                }
            });

            state.likedPosts.forEach((post) => {
                if (post.user._id === updatedUser._id) {
                    post.user = {
                        ...post.user,
                        ...updatedUser,
                    };
                }
            });
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPost.pending, (state) => {
                state.loading = true;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message);
            })
            .addCase(createPost.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to create post");
            })
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
            .addCase(getUserPosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserPosts.fulfilled, (state, action) => {
                state.loading = false;

                const userPosts = action.payload;
                userPosts.forEach((incoming) => {
                    const index = state.posts.findIndex((p) => p._id === incoming._id);
                    if (index !== -1) {
                        state.posts[index] = incoming;
                    } else {
                        state.posts.push(incoming);
                    }
                })
            })
            .addCase(getUserPosts.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to get user posts");
            })
            .addCase(toggleLike.pending, (state, action) => {
                const { postId, userId } = action.meta.arg as ToggleLikePayload;
                const post = state.posts.find((p) => p._id === postId);
                if (!post) return;

                const wasLiked = post.likes_count.includes(userId);
                // store previous liked-state for potential rollback
                state.pendingLikeMap[postId] = wasLiked;

                if (wasLiked) {
                    post.likes_count = post.likes_count.filter((id) => id !== userId);

                } else {
                    if (!post.likes_count.includes(userId)) {
                        post.likes_count.push(userId);
                    }
                }

                // OPTIMISTIC likedPosts sync
                if (!wasLiked && post.user._id !== userId) {
                    // like → add to likedPosts
                    if (!state.likedPosts.find((p) => p._id === postId)) {
                        state.likedPosts.unshift(post);
                    }
                }

                if (wasLiked) {
                    // unlike → remove from likedPosts
                    state.likedPosts = state.likedPosts.filter((p) => p._id !== postId);
                }
            })
            .addCase(toggleLike.fulfilled, (state, action) => {
                const { postId, message } = action.payload as { postId: string, message: string };
                const post = state.posts.find((p) => p._id === postId);
                if (!post) {
                    // clear any stale pending entry
                    delete state.pendingLikeMap[postId];
                    return;
                }

                const metaUserId = (action.meta?.arg as ToggleLikePayload | undefined)?.userId;
                if (!metaUserId) {
                    // no userId available — just clear pending map entry and return
                    delete state.pendingLikeMap[postId];
                    return;
                }

                toast.success(message);

                if (message === "Post liked") {
                    if (!post.likes_count.includes(metaUserId)) {
                        post.likes_count.push(metaUserId);
                    }

                } else if (message === "Post unliked") {
                    post.likes_count = post.likes_count.filter((id) => id !== metaUserId);
                }

                // clear pending marker
                delete state.pendingLikeMap[postId];
            })
            .addCase(toggleLike.rejected, (state, action) => {
                const { postId, userId } = action.meta.arg as ToggleLikePayload;
                const post = state.posts.find((p) => p._id === postId);
                // read previous liked-state, if present
                const previousLiked = state.pendingLikeMap[postId];

                if (post) {
                    if (typeof previousLiked === "boolean") {
                        // revert to previous state
                        if (previousLiked) {
                            // if previously liked, ensure userId exists
                            if (!post.likes_count.includes(userId)) post.likes_count.push(userId);

                            if (post.user._id !== userId) state.likedPosts.unshift(post);
                        } else {
                            // if previously not liked, ensure userId is absent
                            post.likes_count = post.likes_count.filter((id) => id !== userId);

                            state.likedPosts = state.likedPosts.filter((p) => p._id !== postId);
                        }
                    } else {
                        // no previous state recorded; as a fallback, toggle back
                        const currentlyLiked = post.likes_count.includes(userId);
                        if (currentlyLiked) {
                            post.likes_count = post.likes_count.filter((id) => id !== userId);
                        } else {
                            post.likes_count.push(userId);
                        }
                    }
                }

                // cleanup
                delete state.pendingLikeMap[postId];

                // surface error to user
                toast.error(typeof action.payload === "string" ? action.payload : "Failed to toggle like");
            })
            .addCase(getPostById.fulfilled, (state, action) => {
                const incomingPost = action.payload;

                const index = state.posts.findIndex((p) => p._id === incomingPost._id);
                if (index !== -1) {
                    // update existing post
                    state.posts[index] = incomingPost;

                } else {
                    // insert new post
                    state.posts.push(incomingPost);
                }
            })
            .addCase(deletePost.pending, (state) => {
                state.loading = true;
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                const { postId, message } = action.payload;

                state.posts = state.posts.filter((p) => p._id !== postId);
                state.loading = false;

                toast.success(message);
            })
            .addCase(deletePost.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to delete post");
            })
            // .addCase(fetchLikedPosts.pending, (state) => {
            //     state.loading = true;
            // })
            .addCase(fetchLikedPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.likedPosts = action.payload;
            })
        // .addCase(fetchLikedPosts.rejected, (state, action) => {
        //     state.loading = false;
        //     toast.error((action.payload as string) || "Failed to fetch liked posts");
        // })
    }
});

export const { clearPosts, updateUserInPosts } = postSlice.actions;

export default postSlice.reducer;
