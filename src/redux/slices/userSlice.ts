import api from "@/lib/axios"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { AxiosError } from "axios";
import toast from "react-hot-toast";

interface User {
    _id: string;
    full_name: string;
    email: string;
}

interface GetUserResponse {
    success: boolean;
    userData?: User;
}

interface ErrorResponse {
    message: string;
}

interface UpdateUserPayload {       // argument type
    userData: FormData;
    token: string;
}

interface UpdateUserResponse {      // return type
    success: boolean;
    data?: User;
    message: string;
}

interface UserState {
    value: User | null;
}

const initialState: UserState = {
    value: null
}

export const fetchUser = createAsyncThunk<User | null, string, { rejectValue: ErrorResponse | string }>("user/getUser", async (token, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/user/getUser", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success && data.userData) {
            return data.userData;
        }

        return null;

    } catch (err) {
        const error = err as AxiosError<ErrorResponse>;

        if (error.response?.data) {
            return rejectWithValue(error.response.data);
        }

        return rejectWithValue("Request failed")
    }
})


export const updateProfile = createAsyncThunk<UpdateUserResponse, UpdateUserPayload, { rejectValue: string | object }>("user/updateProfile", async ({ userData, token }, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/user/updateProfile", userData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success) {
            toast.success(data.message);
            return data;
        }

        toast.error(data.message);
        return rejectWithValue(data);

    } catch (err) {
        const error = err as AxiosError;

        if (error.response?.data) {
            return rejectWithValue(error.response.data);
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
            state.value = action.payload
        }).addCase(updateProfile.fulfilled, (state, action) => {
            state.value = action.payload.data ?? state.value;
        });
    }
})

export default userSlice.reducer