import userModel from "@/models/userModel";
import { protectUser } from "../../../../middleware/userAuth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const { input } = body;

        const allUsers = await userModel.find(
            {
                $or: [
                    { user_name: new RegExp(input, "i") },
                    { email: new RegExp(input, "i") },
                    { full_name: new RegExp(input, "i") },
                    { location: new RegExp(input, "i") }
                ]
            }
        );

        const filteredUsers = allUsers.filter((u) => u._id !== user._id);

        return NextResponse.json({ success: true, users: filteredUsers });

    } catch (error) {
        const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(error);
        return NextResponse.json({ success: false, message: errMesage });
    }
}