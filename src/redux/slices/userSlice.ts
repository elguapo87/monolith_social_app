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

interface UserState {
    value: User | null;
    loading: boolean;
}

const initialState: UserState = {
    value: null,
    loading: false
}

interface UpdateUserPayload {
    userData: FormData;
    token: string;
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


const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state)=> {
                state.loading = true;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.value = action.payload!;
            })
            .addCase(fetchUser.rejected, (state) => {
                state.loading = false;
            })
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.value = action.payload!;
            })
            .addCase(updateProfile.rejected, (state) => {
                state.loading = false;
            });
    }
})

export default userSlice.reducer;