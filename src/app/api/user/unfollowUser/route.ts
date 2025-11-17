import { protectUser } from "@/middleware/userAuth";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user: authUser } = await protectUser();
        if (!authorized || !authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id: targetUserId } = body;

        if (authUser._id.toString() === targetUserId) {
            return NextResponse.json({ success: false, message: "You cannot follow yourself" }, { status: 400 });
        }

        const targetUser = await userModel.findById(targetUserId);
        if (!targetUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        if (!authUser.following.includes(targetUserId)) {
            return NextResponse.json({ success: false, message: "You are not following this user" }, { status: 400 });
        }

        authUser.following.pull(targetUserId);
        targetUser.followers.pull(authUser._id);

        await Promise.all([authUser.save(), targetUser.save()]);

        return NextResponse.json({ success: true, message: "You are not following this user anymore" });

    } catch (error) {
        const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(error);
        return NextResponse.json({ success: false, message: errMesage });
    }
}