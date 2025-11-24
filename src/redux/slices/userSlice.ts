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
}

const initialState: UserState = {
    value: null
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

        toast.error(data.message);
        return null;
        
    } catch (err) {
        const error = err as AxiosError;
        if (error.response?.data) {
            rejectWithValue(error.response.data);
        }
        return rejectWithValue("Request failed");
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
        rejectWithValue(data);


    } catch (err) {
        const error = err as AxiosError;
        if (error?.response?.data) {
            rejectWithValue(error.response.data);
        }
        return rejectWithValue("Request failed");
    }
});


const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            state.value = action.payload;
        }).addCase(updateProfile.fulfilled, (state, action) => {
            state.value = action.payload
        });
    }
})

export default userSlice.reducer;