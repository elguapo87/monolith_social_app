import api from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

export interface IUser {
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

export interface ConnectionState {
    connections: IUser[];
    followers: IUser[];
    following: IUser[];
    pendingConnections: IUser[];
    loading: boolean;
}

const initialState: ConnectionState = {
    connections: [],
    followers: [],
    following: [],
    pendingConnections: [],
    loading: false
}

export const fetchConnections = createAsyncThunk("connection/getConnecitons", async (token: string | null, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/connection/getUserConnections", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to get connections");;
            return rejectWithValue(data.message);
        }

        return {
            connections: data.connections,
            followers: data.followers,
            following: data.following,
            pendingConnections: data.pendingConnections
        }

    } catch (error) {
        toast.error("Failed to get connections");;
        return rejectWithValue("Failed to get connections");
    }
});

const connectionSlice = createSlice({
    name: "connection",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchConnections.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchConnections.fulfilled, (state, action) => {
                state.loading = false;
                state.connections = action.payload.connections;
                state.followers = action.payload.followers;
                state.following = action.payload.following;
                state.pendingConnections = action.payload.pendingConnections;
            })
            .addCase(fetchConnections.rejected, (state) => {
                state.loading = false;
            })
    }
})

export default connectionSlice.reducer;