import { protectUser } from "@/middleware/userAuth";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user: authUser } = await protectUser();
        if (!authorized || !authUser) {
             return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const userId = authUser._id;

        const body = await req.json();
        const { id } = body;

        const user = await userModel.findById(userId);
        if (user.following.includes(id)) {
            return NextResponse.json({ success: false, message: "You already following this user" }, { status: 401 });
        }

        user.following.push(id);
        await user.save();

        const toUser = await userModel.findById(id);

        toUser.followers.push(userId);
        await toUser.save();

        return NextResponse.json({ success: true, message: "Now You are following this user" });
        
    } catch (error) {
        const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(error);
        return NextResponse.json({ success: false, message: errMesage });
    }
}