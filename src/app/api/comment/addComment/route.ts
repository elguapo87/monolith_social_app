import { protectUser } from "@/middleware/userAuth";
import commentModel from "@/models/commentModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Types } from "mongoose";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { post_id, text } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(post_id)) {
            return NextResponse.json(
                { success: false, message: "Invalid postId" },
                { status: 400 }
            );
        }

        const comment = await commentModel.create({
            user_id: user._id,                 // STRING
            post_id: new Types.ObjectId(post_id),
            text: text.trim()
        });

        const populated = await comment.populate(
            "user_id",
            "full_name profile_picture"
        );

        return NextResponse.json({
            success: true,
            comment: populated
        });

    } catch (err) {
        console.error("addComment error:", err);
        return NextResponse.json(
            { success: false, message: "Failed to add comment" },
            { status: 500 }
        );
    }
}
