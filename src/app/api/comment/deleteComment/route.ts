import { protectUser } from "@/middleware/userAuth";
import commentModel from "@/models/commentModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" });
        }

        const { commentId } = await req.json();
        if (!commentId) {
            return NextResponse.json({ success: false, message: "commentId is required" }, { status: 400 });
        }

        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 });
        }

        if (comment.user_id !== user._id) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        await comment.deleteOne();

        return NextResponse.json(
            { 
                success: true,
                commentId,
                postId: comment.post_id
            }
        );

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}