import { protectUser } from "@/middleware/userAuth";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { authorized, user: authUser } = await protectUser();
        if (!authorized || !authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const profileId = searchParams.get("profileId");

        const user = await userModel.findById(profileId)
            .select("_id full_name user_name bio profile_picture cover_photo location followers following")

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "User not found" }, { status: 500});
    }
}