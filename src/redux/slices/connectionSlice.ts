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
    connectionId?: string;
}

export interface PendingData {
    _id: string;
    from_user_id: IUser | { _id: string };
    to_user_id: IUser | { _id: string };
    status: string;
    updatedAt?: Date;
    createdAt?: Date;
}

export interface ConnectionState {
    connections: IUser[];
    followers: IUser[];
    following: IUser[];
    pendingConnections: PendingData[]
    pendingSent: PendingData[];
    loading: boolean;
}

interface ConnectionPayload {
    id: string | null;
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

export const declineConnectionRequest = createAsyncThunk("connection/DeclineConnectionRequest", async ({ id, token }: ConnectionPayload, { rejectWithValue }) => {
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

export const cancelConnectionRequest = createAsyncThunk("connection/cancelConnectionRequest", async ({ connectionId, token }: { connectionId: string, token: string | null }, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/connection/cancelRequest", { connectionId }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to cancel connection request");;
            return rejectWithValue(data.message);
        }

        return { connectionId, message: data.message };

    } catch (error) {
        toast.error("Failed to cancel connection request");;
        return rejectWithValue("Failed to cancel connection request");
    }
});

export const deleteConnection = createAsyncThunk("connection/deleteConnection", async ({ connectionId, token }: { connectionId: string, token: string | null }, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/connection/deleteConnection", { connectionId }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed delete connection");;
            return rejectWithValue(data.message);
        }

        return { connectionId, message: data.message };

    } catch (error) {
        toast.error("Failed delete connection");;
        return rejectWithValue("Failed delete connection");
    }
});

const connectionSlice = createSlice({
    name: "connection",
    initialState,
    reducers: {
        addPendingConnection: (state, action) => {
            const exists = state.pendingConnections.some(
                (c) => c._id === action.payload._id
            );

            if (!exists) {
                state.pendingConnections.unshift(action.payload);
            }
        },

        removePendingConnection: (state, action) => {
            state.pendingConnections = state.pendingConnections.filter(
                (c) => c._id !== action.payload
            );
        }
    },
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
            .addCase(sendConnection.pending, (state) => {
                state.loading = true;
            })
            .addCase(sendConnection.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message);
            })
            .addCase(sendConnection.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to send connection request");
            })
            .addCase(acceptConnectionRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message);
            })
            .addCase(acceptConnectionRequest.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to accept connection request");
            })
            .addCase(declineConnectionRequest.pending, (state) => {
                state.loading = true
            })
            .addCase(declineConnectionRequest.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message);
            })
            .addCase(declineConnectionRequest.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to decline connection request");
            })
            .addCase(cancelConnectionRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(cancelConnectionRequest.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message);
            })
            .addCase(cancelConnectionRequest.rejected, (state, action) => {
                state.loading = true;
                toast.error((action.payload as string) || "Failed to cancel connection request");
            })
            .addCase(deleteConnection.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteConnection.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message);
            })
            .addCase(deleteConnection.rejected, (state, action) => {
                state.loading = true;
                toast.error((action.payload as string) || "Failed delete connection");
            })
    }
})

export const { addPendingConnection, removePendingConnection } = connectionSlice.actions;

export default connectionSlice.reducer;