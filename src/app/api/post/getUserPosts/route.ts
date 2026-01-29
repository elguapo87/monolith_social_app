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
        const profileId = searchParams.get("profileId");

        const posts = await postModel.find({
            user: profileId
        })
            .populate("user", "_id full_name user_name bio profile_picture cover_photo location followers following")
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, posts });
        
    } catch (error) {
        console.error("Get posts error:", error);
        return NextResponse.json({ success: false, message: "Failed to get user posts" }, { status: 500 });
    }
}