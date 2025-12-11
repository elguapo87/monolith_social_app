import { protectUser } from "@/middleware/userAuth";
import messageModel from "@/models/messageModel";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Aggregate unread messages grouped by sender
        const unread = await messageModel.aggregate([
            {
                $match: {
                    to_user_id: user._id.toString(),
                    seen: false
                }
            },
            {
                $group: {
                    _id: "$from_user_id",
                    unread_count: { $sum: 1 },
                    last_message_text: { $last: "$text" },
                    last_message_media: { $last: "$media_url" },
                    last_message_date: { $last: "$createdAt" }
                }
            },
            { $sort: { last_message_date: -1 } }
        ]);

        // Fetch user info for each sender
        const senderIds = unread.map((u) => u._id);

        const users = await userModel.find(
            { _id: { $in: senderIds } },
            "full_name profile_picture"
        )

        // Merge aggregation results with user data
        const merged = unread.map((item) => {
            const userInfo = users.find((u) => u._id === item._id) || {};
            return {
                from_user_id: item._id,
                unread_count: item.unread_count,
                last_message_text: item.last_message_text,
                last_message_media: item.last_message_media,
                last_message_date: item.last_message_date,
                user: userInfo
            };
        });

        return NextResponse.json({ success: true, unread: merged });

    } catch (error) {
        console.error("Unread count error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to get unread count" },
            { status: 500 }
        );
    }
};