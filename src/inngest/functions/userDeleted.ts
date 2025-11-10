import connectDB from "@/config/db";
import { inngest } from "@/inngest/client";
import userModel from "@/models/userModel";

// 🧱 Handle Clerk "user.deleted" webhook event
export const handleClerkUserDeleted = inngest.createFunction(
  { id: "Handle Clerk User Deleted" },
  { event: "user.deleted" },
  async ({ event, step }) => {
    // 1️⃣ Connect to MongoDB
    await step.run("connect-db", async () => {
      await connectDB();
    });

    // 2️⃣ Get the user ID from Clerk event
    const clerkUserId = event.data.id;

    // 3️⃣ Remove user from your DB
    await step.run("delete-user", async () => {
      const deleted = await userModel.findByIdAndDelete(clerkUserId);

      if (deleted) {
        console.log(`🗑️ Deleted user from DB: ${clerkUserId}`);
      } else {
        console.log(`⚠️ No user found for Clerk ID: ${clerkUserId}`);
      }
    });

    return { success: true, clerkUserId };
  }
);
