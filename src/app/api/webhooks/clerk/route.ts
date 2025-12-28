export const runtime = "nodejs";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { inngest } from "@/inngest/client";

console.log("🔥 WEBHOOK HIT");

interface ClerkUser {
  id: string;
  first_name?: string;
  last_name?: string;
  email_addresses?: { email_address: string }[];
  image_url?: string;
}

type ClerkEvent = {
    id: string;
    type: string; // e.g., "user.created"
    data: ClerkUser;
    object: string;
    // Add more fields here if needed
};


export async function POST(req: Request) {
    const payload = await req.text();
    const heads = headers();

    const svix_id = (await heads).get("svix-id");
    const svix_timestamp = (await heads).get("svix-timestamp");
    const svix_signature = (await heads).get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Missing Svix headers", { status: 400 });
    }

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

    let evt: ClerkEvent;
    try {
        evt = wh.verify(payload, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as ClerkEvent; // ✅ cast as ClerkEvent
    } catch (err) {
        console.error("❌ Webhook verification failed:", err);
        return new Response("Invalid signature", { status: 400 });
    }

    // Log to ensure it’s working
    console.log("✅ Clerk webhook received:", evt.type);

    // Forward to Inngest
    await inngest.send({
        name: evt.type, // "user.created" etc.
        data: evt.data,
    });

    return new Response("Webhook received", { status: 200 });
}