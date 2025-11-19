import { protectUser } from "@/middleware/userAuth";
import storyModel from "@/models/storyModel";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { authorized, user: authUser } = await protectUser();
        if (!authorized || !authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const user = await userModel.findById(authUser._id);

        const userIds = [...new Set([authUser._id, ...user.connections, ...user.following])];

        const stories = await storyModel.find({ user: { $in: userIds } }).populate("user").sort({ createdAt: -1 });

        return NextResponse.json({ success: true, stories });

    } catch (error) {
        console.error("Get stories error:", error);
        return NextResponse.json(
            { success: false, message: "Failed get stories" },
            { status: 500 }
        );
    }
}