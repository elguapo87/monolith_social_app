import storyModel from "@/models/storyModel";
import { inngest } from "../client";
import connectDB from "@/config/db";

export const deleteStory = inngest.createFunction(
    { id: "story-delete" },
    { event: "app/story-delete" },
    async ({ event, step }) => {
        const { storyId } = event.data;
        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await step.sleepUntil("wait-for-24-hours", in24Hours);
        await step.run("delete-story", async () => {

            await connectDB();

            await storyModel.findByIdAndDelete(storyId);
            return { message: "Story deleted." }; 
        })
    }
)