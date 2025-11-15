import { protectUser } from "@/middleware/userAuth";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const userData = await userModel.findById(user._id);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, userData });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: "User not found" });
    }
}