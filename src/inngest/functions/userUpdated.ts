import connectDB from "@/config/db";
import { inngest } from "@/inngest/client";
import userModel from "@/models/userModel";

export const handleClerkUserUpdated = inngest.createFunction(
  { id: "handle-clerk-user-updated" },
  { event: "user.updated" },
  async ({ event, step }) => {
    console.log("🌀 Inngest: Received Clerk user.updated event");

    try {
      await step.run("update-user-in-db", async () => {
        await connectDB();

        const data = event.data;
        const clerkUserId = data.id;

        // 🧩 Build updated user fields
        const fullName =
          data.first_name && data.last_name
            ? `${data.first_name} ${data.last_name}`
            : data.first_name ||
              data.username ||
              data.email_addresses?.[0]?.email_address?.split("@")[0] ||
              "User";

        const updatedFields = {
          email: data.email_addresses?.[0]?.email_address ?? "",
          full_name: fullName,
          profile_picture: data.image_url || "https://www.gravatar.com/avatar?d=mp",
        };

        console.log("🧠 Updating user in MongoDB:", updatedFields);

        // ✅ Update user by Clerk ID (stored as _id)
        const updated = await userModel.findByIdAndUpdate(
          clerkUserId,
          { $set: updatedFields },
          { new: true } // returns the updated document
        );

        if (updated) {
          console.log(`✅ Updated user in MongoDB: ${clerkUserId}`);
        } else {
          console.log(`⚠️ No user found for Clerk ID: ${clerkUserId}`);
        }
      });

      return { success: true };
    } catch (error: any) {
      console.error("❌ Error updating user:", error);
      return { success: false, error: error.message };
    }
  }
);
