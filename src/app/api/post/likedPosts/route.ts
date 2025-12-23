import { protectUser } from "@/middleware/userAuth";
import postModel from "@/models/postModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const likedPosts = await postModel.find({
            likes_count: user._id,
            user: { $ne: user._id }
        })
            .populate("user")
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({ success: true, posts: likedPosts });

    } catch (error) {
        console.error("likedPosts error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch liked posts" }, { status: 500 });
    }
}