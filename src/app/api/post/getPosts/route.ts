import { protectUser } from "@/middleware/userAuth";
import postModel from "@/models/postModel";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { authorized, user: authUser } = await protectUser();
        if (!authorized || !authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const user = await userModel.findById(authUser._id);

        // User connections & followings
        const userIds = [...new Set([authUser._id, ...user.connections, ...user.following])];

        const posts = await postModel.find({ user: { $in: userIds } }).populate("user").sort({ createdAt: -1 });

        return NextResponse.json({ success: true, posts });

    } catch (error) {
        console.error("Get posts error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to get posts" },
            { status: 500 }
        );
    }
}