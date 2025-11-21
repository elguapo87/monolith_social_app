import { protectUser } from "@/middleware/userAuth";
import messageModel from "@/models/messageModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const messages = await messageModel.find({
            to_user_id: user._id
        }).populate("from_user_id to_user_id").sort({ createdAt: -1 });

        return NextResponse.json({ success: true, messages });

    } catch (error) {
        console.error("Get recent messages error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to get recent messages" },
            { status: 500 }
        );
    }
}