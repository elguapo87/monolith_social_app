import { protectUser } from "@/middleware/userAuth";
import postModel from "@/models/postModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const postId = searchParams.get("postId");

        if (!postId) {
            return NextResponse.json({ success: false, message: "postId query param is required" }, { status: 400 });
        }

        const post = await postModel.findById(postId).populate("user");

        if (!post) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, post });

    } catch (error) {
        console.error("Get posts error:", error);
        return NextResponse.json({ success: false, message: "Failed to get post" }, { status: 500 });
    }
}