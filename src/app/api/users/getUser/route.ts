import { protectUser } from "@/middleware/userAuth";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { authorized, userId } = await protectUser();
        if (!authorized || !userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const user = await userModel.findById(userId).lean();
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: true, message: "User not found" });
    }
}