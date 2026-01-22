import { protectUser } from "@/middleware/userAuth";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const users = await userModel.find({
            _id: { $ne: user._id }
        })
            .sort({ createdAt: -1 })
            .limit(12)
            .select("full_name user_name bio profile_picture location followers");

        return NextResponse.json({ success: true, recentUsers: users });

    } catch (error) {
        const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(error);
        return NextResponse.json({ success: false, message: errMesage });
    }
}