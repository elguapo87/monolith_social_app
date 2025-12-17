import { protectUser } from "@/middleware/userAuth";
import commentModel from "@/models/commentModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" });
        }

        const comments = await commentModel.find({})
            .populate("user_id", "full_name profile_picture")
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, comments });

    } catch (error) {
        const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(error);
        return NextResponse.json({ success: false, message: errMesage });
    }
};