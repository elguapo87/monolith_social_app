import { protectUser } from "@/middleware/userAuth";
import postModel from "@/models/postModel";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { authorized, user: authUser } = await protectUser();
        if (!authorized || !authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { profileId } = await req.json();

        const profile = await userModel.findById(profileId);

        if (!profile) {
            return NextResponse.json({ success: false, message: "Profile not found" });
        }

        const post = await postModel.find({ user: profileId }).populate("user");

        return NextResponse.json({ success: true, profile, post }); 

    } catch (error) {
        console.error("Add post error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to get user data" },
            { status: 500 }
        );
    }
}