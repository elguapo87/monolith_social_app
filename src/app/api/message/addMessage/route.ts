import imageKit from "@/config/imageKit";
import { protectUser } from "@/middleware/userAuth";
import messageModel from "@/models/messageModel";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher/server";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const form = await req.formData();
        const to_user_id = form.get("id") as string;
        const text = form.get("text") as string;
        const imageFile = form.get("image") as File | null;

        if (!text && !imageFile) {
            return NextResponse.json(
                { success: false, message: "Message must contain text or image." },
                { status: 400 }
            );
        }

        if (to_user_id === user._id) {
            return NextResponse.json(
                { success: false, message: "Cannot send a message to yourself." },
                { status: 400 }
            );
        }

        const receiver = await userModel.findById(to_user_id);
        if (!receiver) {
            return NextResponse.json(
                { success: false, message: "Receiver not found." },
                { status: 404 }
            );
        }

        let msgImage: string | null = null;

        if (imageFile) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());

            const uploadRes = await imageKit.upload({
                file: buffer,
                fileName: `message_${user._id}_${Date.now()}`,
                folder: "/monolith/messages"
            });

            msgImage = imageKit.url({
                src: uploadRes.url,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { width: "1280" }
                ]
            });
        }

        const message_type: "text" | "image" = msgImage ? "image" : "text";

        let message = await messageModel.create({
            from_user_id: user._id,
            to_user_id,
            text: text || "",
            media_url: msgImage,
            message_type
        });

        // Populate before sending to SSE
        message = await message.populate("from_user_id")

        // Convert to clean plain JSON object
        const messagePayload = JSON.parse(JSON.stringify(message));

        await pusherServer.trigger(
            `user-${to_user_id}`,
            "new-message",
            messagePayload
        );

        // Build notification payload
        const notificationPayload = {
            from_user_id: user._id,
            last_message_text: message.text,
            last_message_media: message.media_url,
            unread_count: 1,
            last_message_date: message.createdAt,
            user: {
                _id: user._id,
                full_name: user.full_name,
                profile_picture: user.profile_picture
            }
        };

        // Send notification to receiver
        await pusherServer.trigger(
            `user-${to_user_id}`,
            "new-notification",
            notificationPayload
        );

        return NextResponse.json({ success: true, message: messagePayload });

    } catch (error) {
        console.error("Add message error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to create message" },
            { status: 500 }
        );
    }
}

