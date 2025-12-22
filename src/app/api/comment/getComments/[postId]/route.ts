import { protectUser } from "@/middleware/userAuth";
import commentModel from "@/models/commentModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    context: { params: Promise<{ postId: string }> }
) {
    try {
        const { postId } = await context.params;

        const { authorized } = await protectUser();
        if (!authorized) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return NextResponse.json(
                { success: true, comments: [] },
                { status: 200 }
            );
        }

        const comments = await commentModel
            .find({ post_id: new mongoose.Types.ObjectId(postId) })
            .populate("user_id", "full_name profile_picture")
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            comments
        });

    } catch (err) {
        console.error("getComments error:", err);
        return NextResponse.json(
            { success: false, message: "Failed to fetch comments" },
            { status: 500 }
        );
    }
}
