import api from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

interface Story {
    _id: string
    user: {
        _id: string;
        full_name: string;
        profile_picture?: string;
    }
    content: string;
    media_url: string
    media_type: string
    background_color: string
    createdAt?: Date;
    updatedAt?: Date;
    view_count?: string[];
}

interface StoryData {
    stories: Story[];
    loading: boolean;
    viewing: boolean;
}

interface AddStoryPayload {
    storyData: FormData;
    token: string | null;
}

const initialState: StoryData = {
    stories: [],
    loading: false,
    viewing: false
};

export const addStory = createAsyncThunk("story/addStory", async (
    { storyData, token }: AddStoryPayload, { rejectWithValue }
) => {
    try {
        const { data } = await api.post("/story/addStory", storyData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to add story");
            return rejectWithValue(data.message || "Failed to add story");
        }

        return { message: data.message };

    } catch (error) {
        toast.error("Failed to add story");;
        return rejectWithValue("Failed to add story");
    }
});

export const fetchStories = createAsyncThunk("story/getStories", async (token: string | null, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/story/getStories", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to fetch stories");
            return rejectWithValue(data.message || "Failed to fetch stories");
        }

        return data.stories;

    } catch (error) {
        toast.error("Failed to fetch stories");;
        return rejectWithValue("Failed to fetch stories");
    }
});

export const viewStoryCount = createAsyncThunk("story/view", async (
    { storyId, token, userId }: { storyId: string, token: string | null, userId: string }, { rejectWithValue }
) => {
    try {
        const { data } = await api.post("/story/view", { storyId }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.success) {
            toast.error(data.message || "Failed to view story");
            return rejectWithValue(data.message || "Failed to view story");
        }

        return { storyId, userId };

    } catch (error) {
        toast.error("Failed to view story");;
        return rejectWithValue("Failed to view story");
    }
});

const storySlice = createSlice({
    name: "story",
    initialState,
    reducers: {
        clearStories: (state) => {
            state.stories = [];
            state.loading = false;
            state.viewing = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addStory.pending, (state) => {
                state.loading = true;
            })
            .addCase(addStory.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message);
            })
            .addCase(addStory.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to add story");
            })
            .addCase(fetchStories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStories.fulfilled, (state, action) => {
                state.loading = false;
                state.stories = action.payload;
            })
            .addCase(fetchStories.rejected, (state, action) => {
                state.loading = false;
                toast.error((action.payload as string) || "Failed to fetch stories");
            })
            .addCase(viewStoryCount.pending, (state) => {
                state.viewing = true
            })
            .addCase(viewStoryCount.fulfilled, (state, action) => {
                state.viewing = false;
                const { storyId, userId } = action.payload;

                const story = state.stories.find((s) => s._id === storyId);
                if (story) {
                    if (!story.view_count) {
                        story.view_count = [];
                    }

                    if (!story.view_count.includes(userId)) {
                        story.view_count.push(userId)
                    }
                }
            })
            .addCase(viewStoryCount.rejected, (state, action) => {
                state.viewing = false;
                toast.error((action.payload as string) || "Failed to view story");
            })
    }
})

export const { clearStories } = storySlice.actions;

export default storySlice.reducer;