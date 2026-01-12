import { protectUser } from "@/middleware/userAuth";
import connectionModel from "@/models/connectionModel";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user: authUser } = await protectUser();
        if (!authorized || !authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id } = body;

        const connection = await connectionModel.findOne({ 
            from_user_id: id, 
            to_user_id: authUser._id,
            status: "pending" 
        });
        if (!connection) {
            return NextResponse.json({ success: false, message: "Connection not found" });
        }

        const user = await userModel.findById(authUser._id);
        user.connections.push(id);
        await user.save();

        const toUser = await userModel.findById(id);
        toUser.connections.push(authUser._id);
        await toUser.save();

        connection.status = "accepted";
        await connection.save();

        return NextResponse.json({ success: true, message: "Connection request accepted" });

    } catch (error) {
        const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(error);
        return NextResponse.json({ success: false, message: errMesage });
    }
}