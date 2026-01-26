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
}

interface AddStoryPayload {
    storyData: FormData;
    token: string | null;
}

const initialState: StoryData = {
    stories: [],
    loading: false
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
})

const storySlice = createSlice({
    name: "story",
    initialState,
    reducers: {},
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
    }
})

export default storySlice.reducer;