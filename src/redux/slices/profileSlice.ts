import api from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { updateProfile } from "./userSlice";

interface Profile {
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

interface ProfileState {
    profile: Profile | null;
    loading: boolean;
}

const initialState: ProfileState = {
    profile: null,
    loading: false,
}

export const getUserById = createAsyncThunk("user/getUserById", async (
    { profileId, token }: { profileId: string, token: string | null }, { rejectWithValue }
) => {
    try {
        const { data } = await api.get("/user/getUserById", {
            params: { profileId },
            headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success && data.user) {
            return data.user;
        }

        toast.error(data.message || "Failed to get user");
        return rejectWithValue("Failed to get user");

    } catch (err) {
        const error = err as AxiosError;
        const message = (error.response?.data as Record<string, number>)?.message || "Request failed";
        return rejectWithValue(message);
    }
});

const userSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getUserById.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserById.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(getUserById.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to get user");
            })

            .addCase(updateProfile.fulfilled, (state, action) => {
                if (state.profile && state.profile._id === action.payload._id) {
                    state.profile = {
                        ...state.profile,
                        ...action.payload
                    };
                }
             });
    }
})

export default userSlice.reducer;