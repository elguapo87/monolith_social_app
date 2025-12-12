import { protectUser } from "@/middleware/userAuth";
import messageModel from "@/models/messageModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const { from_user_id } = await req.json();

        await messageModel.updateMany(
            { from_user_id, to_user_id: user._id, seen: false },
            { $set: { seen: true } }
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Seen update error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}