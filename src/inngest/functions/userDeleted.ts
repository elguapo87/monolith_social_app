import connectDB from "@/config/db";
import { inngest } from "@/inngest/client";
import connectionModel from "@/models/connectionModel";
import messageModel from "@/models/messageModel";
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

    // 4️⃣ Remove user from other users’ arrays
    await step.run("cleanup-user-references", async () => {
      await userModel.updateMany(
        {},
        {
          $pull: {
            connections: clerkUserId,
            followers: clerkUserId,
            following: clerkUserId
          }
        }
      );
    });

    // 5️⃣ Delete all connections involving this user
    await step.run("delete-user-connections", async () => {
      await connectionModel.deleteMany({
        $or: [
          { from_user_id: clerkUserId },
          { to_user_id: clerkUserId }
        ]
      });
    });

    // 6️⃣ Delete all messages involving this user
    await step.run("delete-user-messages", async () => {
      await messageModel.deleteMany({
        $or: [
          { from_user_id: clerkUserId },
          { to_user_id: clerkUserId }
        ]
      });
    });

    return { success: true, clerkUserId };
  }
);
