import { protectUser } from "@/middleware/userAuth";
import messageModel from "@/models/messageModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { to_user_id } = await req.json();

        const messages = await messageModel.find({
            $or: [
                { from_user_id: user._id, to_user_id },
                { from_user_id: to_user_id, to_user_id: user._id }
            ]
        })
            .sort({ createdAt: -1 });

        // Mark messages as seen
        await messageModel.updateMany(
            { from_user_id: to_user_id, to_user_id: user._id },
            { seen: true }
        );

        return NextResponse.json({ success: true, messages });

    } catch (error) {
        console.error("Get messages error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to get messages" },
            { status: 500 }
        );
    }

}