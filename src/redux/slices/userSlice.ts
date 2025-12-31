import api from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { AxiosError } from "axios";
import toast from "react-hot-toast";

interface User {
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
}

interface Post {
    _id: string;
    user: User;
    content: string;
    image_urls: string[];
    post_type: string;
    likes_count: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

interface UserState {
    value: User | null;
    loading: boolean;
    profileData: User | null;
    profilePosts: Post[];
}


interface UpdateUserPayload {
    userData: FormData;
    token: string;
}

interface GetUserProfilesPayload {
    profileId: string;
    token: string | null;
}

interface FollowPayload {
    targetUserId: string;
    token: string | null;
}

const initialState: UserState = {
    value: null,
    loading: false,
    profileData: null,
    profilePosts: []
}

export const fetchUser = createAsyncThunk("user/getUser", async (token: string, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/user/getUser", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success && data.userData) {
            return data.userData;
        }

        toast.error(data.message || "Failed to load user");
        return rejectWithValue("Failed to load user");

    } catch (err) {
        const error = err as AxiosError;
        const message = (error.response?.data as Record<string, number>)?.message || "Request failed";
        return rejectWithValue(message);
    }
});

export const updateProfile = createAsyncThunk("user/updateProfile", async ({ userData, token }: UpdateUserPayload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/user/updateProfile", userData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success) {
            toast.success(data.message);
            return data.data;
        }

        toast.error(data.message);
        return rejectWithValue(data.message);


    } catch (err) {
        const error = err as AxiosError;
        const message = (error.response?.data as Record<string, number>)?.message || "Request failed";
        return rejectWithValue(message);
    }
});


export const getUserProfiles = createAsyncThunk("user/getUserProfiles", async ({ profileId, token }: GetUserProfilesPayload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/user/getUserProfiles", { profileId }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to load profile");
            return rejectWithValue(data.message || "Failed to load profile")
        }

        return {
            profile: data.profile,
            post: data.post
        }

    } catch (error) {
        toast.error("Request failed");
        return rejectWithValue("Request failed");
    }
});

export const followUser = createAsyncThunk("user/follow", async ({ targetUserId, token }: FollowPayload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/user/followUser", { targetUserId }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to follow user");
            return rejectWithValue(data.message || "Failed to follow user");
        }

        return { targetUserId, message: data.message };

    } catch (error) {
        toast.error("Failed to follow user");
        return rejectWithValue("Failed to follow user");
    }
});

export const unfollowUser = createAsyncThunk("user/unfollow", async ({ targetUserId, token }: FollowPayload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/user/unfollowUser", { targetUserId }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to unfollow user");
            return rejectWithValue(data.message || "Failed to unfollow user");
        }

        return { targetUserId, message: data.message };

    } catch (error) {
        toast.error("Failed to unfollow user");
        return rejectWithValue("Failed to unfollow user");
    }
});

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        clearUser: (state) => {
            state.value = null;
            state.profileData = null;
            state.profilePosts = [];
            state.loading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.value = action.payload!;
            })
            .addCase(fetchUser.rejected, (state) => {
                state.loading = false;
                state.value = null;
            })
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                if (state.value) {
                    state.value = {
                        ...state.value,        
                        ...action.payload      
                    };
                }
            })
            .addCase(updateProfile.rejected, (state) => {
                state.loading = false;
            })
            .addCase(getUserProfiles.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserProfiles.fulfilled, (state, action) => {
                state.loading = false;
                state.profileData = action.payload.profile;
                state.profilePosts = action.payload.post;
            })
            .addCase(getUserProfiles.rejected, (state) => {
                state.loading = false;
            })
            .addCase(followUser.pending, (state, action) => {
                const targetUserId = action.meta.arg.targetUserId;
                const currentUserId = state.value?._id;

                if (!state.value || !currentUserId) return;

                // OPTIMISTIC UPDATE
                if (!state.value.following?.includes(targetUserId)) {
                    state.value.following?.push(targetUserId);
                }

                // Update profile page followers (if we are viewing THAT profile)
                if (state.profileData && state.profileData._id === targetUserId) {
                    if (!state.profileData.followers?.includes(currentUserId)) {
                        state.profileData.followers?.push(currentUserId);
                    }
                }

                state.loading = true;
            })
            .addCase(followUser.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message);
            })
            .addCase(followUser.rejected, (state, action) => {
                const targetUserId = action.meta.arg.targetUserId;
                const currentUserId = state.value?._id;

                if (!state.value || !currentUserId) return;

                // ROLLBACK optimistic update
                state.value.following = state.value.following?.filter(id => id !== targetUserId);

                if (state.profileData && state.profileData._id === targetUserId) {
                    state.profileData.followers = state.profileData.followers?.filter(id => id !== currentUserId);
                }

                state.loading = false;
                toast.error(action.payload as string || "Failed to follow user");
            })
            .addCase(unfollowUser.pending, (state, action) => {
                const targetUserId = action.meta.arg.targetUserId;
                const currentUserId = state.value?._id;

                if (!state.value || !currentUserId) return;

                // OPTIMISTIC UPDATE (remove user from following list)
                if (state.value.following?.includes(targetUserId)) {
                    state.value.following = state.value.following.filter((id) => id !== targetUserId);
                }

                // Update profile page followers (if we are viewing THAT profile)
                if (state.profileData && state.profileData._id === targetUserId) {
                    if (state.profileData.followers?.includes(currentUserId)) {
                        state.profileData.followers = state.profileData.followers.filter((id) => id !== currentUserId);
                    }
                }

                state.loading = true;
            })
            .addCase(unfollowUser.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message);
            })
            .addCase(unfollowUser.rejected, (state, action) => {
                const targetUserId = action.meta.arg.targetUserId;
                const currentUserId = state.value?._id;

                if (!state.value || !currentUserId) return;

                // ROLLBACK optimistic update - Re-add user to following
                if (!state.value.following?.includes(targetUserId)) {
                    state.value.following?.push(targetUserId);
                }

                // If viewing that profile, re-add follower
                if (state.profileData && state.profileData._id === targetUserId) {
                    if (!state.profileData.followers?.includes(currentUserId)) {
                        state.profileData.followers?.push(currentUserId);
                    }
                }

                state.loading = false;
                toast.error(action.payload as string || "Failed to unfollow user");
            })
    }
})

export const { clearUser } = userSlice.actions;

export default userSlice.reducer;