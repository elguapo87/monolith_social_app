import { protectUser } from "@/middleware/userAuth";
import connectionModel from "@/models/connectionModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user: loggedInUser } = await protectUser();
        if (!authorized || !loggedInUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { otherUserId } = await req.json();

        const connection = await connectionModel.findOne({
            $or: [
                { from_user_id: loggedInUser._id, to_user_id: otherUserId, status: "accepted" },
                { from_user_id: otherUserId, to_user_id: loggedInUser._id, status: "accepted" }
            ]
        })
            .populate("from_user_id")
            .populate("to_user_id");

        if (!connection) {
            return NextResponse.json({ success: false, message: "Connection not found" }, { status: 404 });
        }

        const otherUser = 
        connection.from_user_id._id.toString() === loggedInUser._id
            ? connection.to_user_id 
            : connection.from_user_id;

        return NextResponse.json({ success: true, user: otherUser });

    } catch (error) {
        const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(error);
        return NextResponse.json({ success: false, message: errMesage });
    }
}