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
    pendingSent: IUser[];
    loading: boolean;
}

interface ConnectionPayload {
    id: string;
    token: string | null;
}

const initialState: ConnectionState = {
    connections: [],
    followers: [],
    following: [],
    pendingConnections: [],
    pendingSent: [],
    loading: false
}

export const fetchConnections = createAsyncThunk("connection/getConnections", async (token: string | null, { rejectWithValue }) => {
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
            pendingConnections: data.pendingConnections,
            pendingSent: data.pendingSent
        }

    } catch (error) {
        toast.error("Failed to get connections");;
        return rejectWithValue("Failed to get connections");
    }
});

export const sendConnection = createAsyncThunk("connection/sendConnection", async ({ id, token }: ConnectionPayload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/connection/sendConnection", { id }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to send connection request");;
            return rejectWithValue(data.message);
        }

        return { id, message: data.message };

    } catch (error) {
        toast.error("Failed to send connection request");;
        return rejectWithValue("Failed to send connection request");
    }
});

export const acceptConnectionRequest = createAsyncThunk("connection/acceptConnectionRequest", async ({ id, token }: ConnectionPayload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/connection/acceptConnectionRequest", { id }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to accept connection request");;
            return rejectWithValue(data.message);
        }

        return { id, message: data.message };

    } catch (error) {
        toast.error("Failed to accept connection request");;
        return rejectWithValue("Failed to accept connection request");
    }
});

export const declineConnectionRequest = createAsyncThunk("connection/DeclineConnectionRequest", async({ id, token }: ConnectionPayload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/connection/declineConnectionRequest", { id }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to decline connection request");;
            return rejectWithValue(data.message);
        }

        return { id, message: data.message };

    } catch (error) {
        toast.error("Failed to decline connection request");;
        return rejectWithValue("Failed to decline connection request");
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
                state.pendingSent = action.payload.pendingSent;
            })
            .addCase(fetchConnections.rejected, (state) => {
                state.loading = false;
            })
            .addCase(sendConnection.pending, (state, action) => {
                const targetUserId = action.meta.arg.id;

                // Avoid duplicates in case user spam-clicks
                const alreadyPending = state.pendingSent.some((u) => u._id === targetUserId);
                if (!alreadyPending) {
                    // Optimistic: add target user as pending
                    state.pendingSent.push({ _id: targetUserId } as IUser);
                }

                state.loading = true;
            })
            .addCase(sendConnection.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message);
            })
            .addCase(sendConnection.rejected, (state, action) => {
                const targetUserId = action.meta.arg.id;

                // Rollback optimistic update
                state.pendingSent = state.pendingSent.filter((u) => u._id !== targetUserId);

                state.loading = false;

                toast.error((action.payload as string) || "Failed to send connection request");
            })
            .addCase(acceptConnectionRequest.pending, (state, action) => {
                const targetUserId = action.meta.arg.id;

                state.pendingConnections = state.pendingConnections.filter((u) => u._id !== targetUserId);

                const alreadyConnected = state.connections.some((u) => u._id === targetUserId);
                if (!alreadyConnected) {
                    state.connections.push({ _id: targetUserId } as IUser);
                }

                state.loading = true;
            })
            .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message);
            })
            .addCase(acceptConnectionRequest.rejected, (state, action) => {
                const targetUserId = action.meta.arg.id;

                // Rollback optimistic update
                state.connections = state.connections.filter((u) => u._id !== targetUserId);

                // Re-add to pendingConnections
                state.pendingConnections.push({ _id: targetUserId } as IUser);

                state.loading = false;

                toast.error((action.payload as string) || "Failed to accept connection request");
            })
            .addCase(declineConnectionRequest.pending, (state, action) => {
                const targetUserId = action.meta.arg.id;
                
                // Optimistic: remove the pending request immediately
                state.pendingConnections = state.pendingConnections.filter((u) => u._id !== targetUserId);
                
                state.loading = true
            })
            .addCase(declineConnectionRequest.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message);
            })
            .addCase(declineConnectionRequest.rejected, (state, action) => {
                const targetUserId = action.meta.arg.id;

                // Rollback: re-add the pending connection
                state.pendingConnections.push({ _id: targetUserId } as IUser);

                state.loading = false;
                toast.error((action.payload as string) || "Failed to decline connection request");
            })
    }
})

export default connectionSlice.reducer;