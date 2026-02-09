import api from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

interface UserData {
    _id: string;
    full_name: string;
    user_name: string;
    profile_picture: string;
    location: string;
    bio: string;
    followers: [];
};

export interface ConnectionItem {
    user: UserData;
    connectionId?: string;
    createdAt: Date;
    type: "follower" | "following" | "pending_sent" | "pending_received" | "connection";
}

export interface ConnectionState {
    connections: ConnectionItem[];
    followers: ConnectionItem[];
    following: ConnectionItem[];
    pendingConnections: ConnectionItem[]
    pendingSent: ConnectionItem[];
    connectionUser: UserData | null;
    declined: {
        connectionId: string;
        createdAt: Date;
        user: {
            _id: string;
            full_name: string;
            profile_picture: string;
        };
    }[];
    accepted: {
        connectionId: string;
        createdAt: Date;
        user: {
            _id: string;
            full_name: string;
            profile_picture: string;
        };
    }[];
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
    connectionUser: null,
    declined: [],
    accepted: [],
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

export const getConnectioUser = createAsyncThunk("connection/getConnection", async (
    { otherUserId, token }: { otherUserId: string, token: string | null }, { rejectWithValue }
) => {
    try {
        const { data } = await api.post("/connection/getConnection", { otherUserId }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success && data.user) {
            return data.user;
        }

        return rejectWithValue(data.message || "Failed to get connection user")

    } catch (error) {
        toast.error("Failed to get connection user");;
        return rejectWithValue("Failed to get connection user");
    }
})

const connectionSlice = createSlice({
    name: "connection",
    initialState,
    reducers: {
        addPendingConnection: (state, action) => {
            const exists = state.pendingConnections.some(
                (c) => c.connectionId === action.payload.connectionId
            );

            if (!exists) {
                state.pendingConnections.unshift(action.payload);
            }
        },

        removePendingConnection: (state, action) => {
            state.pendingConnections = state.pendingConnections.filter(
                (c) => c.connectionId !== action.payload
            );
        },

        addDeclinedConnectionNotification: (state, action) => {
            state.declined.unshift(action.payload);
        },

        removePendingSentConnection: (state, action) => {
            state.pendingSent = state.pendingSent.filter((c) => c.connectionId !== action.payload);
        },

        clearDeclinedNotification: (state) => {
            state.declined = [];
        },

        addAcceptedConnectionNotification: (state, action) => {
            const exists = state.accepted.some((c) => c.connectionId === action.payload.connectionId);
            if (!exists) {
                state.accepted.unshift(action.payload);
            }
        },

        finalizeAcceptedConnection: (state, action) => {
            state.connections.unshift({
                user: action.payload.user,
                connectionId: action.payload.connectionId,
                createdAt: action.payload.createdAt,
                type: "connection",
            });

            const isPending = state.pendingSent.some((c) => c.user._id === action.payload.user._id);
            if (isPending) {
                state.pendingSent = state.pendingSent.filter((c) => c.user._id !== action.payload.user._id);
            }
        },

        clearAcceptedNotification: (state) => {
            state.accepted = [];
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
            .addCase(getConnectioUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(getConnectioUser.fulfilled, (state, action) => {
                state.loading = false;
                state.connectionUser = action.payload;
            })
            .addCase(getConnectioUser.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed get connection user");
            })
    }
})

export const {
    addPendingConnection,
    removePendingConnection,
    addDeclinedConnectionNotification,
    removePendingSentConnection,
    clearDeclinedNotification,
    addAcceptedConnectionNotification,
    finalizeAcceptedConnection,
    clearAcceptedNotification
} = connectionSlice.actions;

export default connectionSlice.reducer;