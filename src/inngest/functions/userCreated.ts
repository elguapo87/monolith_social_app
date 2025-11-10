import { inngest } from "../client";
import connectDB from "@/config/db";
import userModel from "@/models/userModel";

export const handleClerkUserCreated = inngest.createFunction(
  { id: "handle-clerk-user-created" },
  { event: "user.created" }, // ✅ remove the "clerk/" prefix
  async ({ event, step }) => {
    console.log("🚀 Inngest: Received Clerk user.created event");

    try {
      await step.run("create-user-in-db", async () => {
        console.log("🔗 Connecting to MongoDB...");
        await connectDB();
        console.log("✅ MongoDB connected");

        const data = event.data;

        const fullName =
          data.first_name && data.last_name
            ? `${data.first_name} ${data.last_name}`
            : data.username ||
              data.email_addresses?.[0]?.email_address?.split("@")[0] ||
              "User";

        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address ?? "",
          full_Name: fullName,
          user_name:
            data.username ||
            fullName.replace(/\s+/g, "").toLowerCase() +
              Math.floor(Math.random() * 1000),
          profile_picture: data.image_url || "https://www.gravatar.com/avatar?d=mp",
        };

        console.log("🧠 Attempting to create user in DB:", userData);

        await userModel.create(userData);

        console.log("✅ User successfully created in MongoDB!");
      });

      return { success: true };
    } catch (error: any) {
      console.error("❌ Inngest function error:", error);
      return { success: false, error: error.message };
    }
  }
);
