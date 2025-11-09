import { Webhook } from "svix";
import connectDB from "@/config/db";
import userModel from "@/models/userModel";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface ClerkUser {
  id: string;
  first_name?: string;
  last_name?: string;
  email_addresses?: { email_address: string }[];
  image_url?: string;
}

interface ClerkEvent {
  data: ClerkUser;
  type: string;
}

export async function POST(req: NextRequest) {
  try {
    const clerkWebhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!clerkWebhookSecret) throw new Error("CLERK_WEBHOOK_SECRET is not defined");

    // Create a Svix webhook verifier
    const wh = new Webhook(clerkWebhookSecret);

    // Extract Clerk headers
    const headerPayload = headers();
    const svixHeaders = {
      "svix-id": (await headerPayload).get("svix-id") ?? "",
      "svix-signature": (await headerPayload).get("svix-signature") ?? "",
      "svix-timestamp": (await headerPayload).get("svix-timestamp") ?? "",
    };

    // Verify and parse the webhook body
    const body = await req.text();
    const event = wh.verify(body, svixHeaders) as ClerkEvent;

    const { data, type } = event;

    await connectDB();

    switch (type) {
      case "user.created":
      case "user.updated": {
        const email = data.email_addresses?.[0]?.email_address ?? "";
        const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim() || email.split("@")[0];
        const username = (data.first_name ? data.first_name.toLowerCase() : email.split("@")[0]) +
          Math.floor(Math.random() * 10000);

        const userData = {
          _id: data.id,
          email,
          full_Name: fullName,
          user_name: username,
          profile_picture: data.image_url ?? "",
        };

        if (type === "user.created") {
          // Upsert logic to avoid duplicate creation
          await userModel.findByIdAndUpdate(data.id, userData, { upsert: true });
        } else {
          await userModel.findByIdAndUpdate(data.id, userData);
        }
        break;
      }

      case "user.deleted":
        await userModel.findByIdAndDelete(data.id);
        break;

      default:
        console.log("Unhandled event type:", type);
        break;
    }

    return NextResponse.json({ message: "Event received" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
