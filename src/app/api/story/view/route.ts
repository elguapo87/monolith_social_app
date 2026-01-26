import { protectUser } from "@/middleware/userAuth";
import storyModel from "@/models/storyModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { storyId } = await req.json();

        await storyModel.findOneAndUpdate(
            { _id: storyId },
            { $addToSet: { view_count: user._id } }
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("View story error", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}