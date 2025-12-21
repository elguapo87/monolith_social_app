import { protectUser } from "@/middleware/userAuth";
import postModel from "@/models/postModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await req.json();
        if (!postId) {
            return NextResponse.json({ success: false, message: "postId is required" }, { status: 400 });
        }

        const deletePost = await postModel.findOneAndDelete({
            _id: postId,
            user: user._id
        });

        if (!deletePost) {
            return NextResponse.json({ success: false, message: "Post not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Post removed" });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}