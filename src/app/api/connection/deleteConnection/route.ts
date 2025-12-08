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

        const { connectionId } = await req.json();

        const connection = await connectionModel.findById(connectionId);
        if (!connection) return NextResponse.json({ success: false, message: "Connection not found" }, { status: 404 });

        const { from_user_id, to_user_id } = connection;

        // Remove each other from connections array
        await userModel.updateOne({ _id: from_user_id }, { $pull: { connections: to_user_id } });
        await userModel.updateOne({ _id: to_user_id }, { $pull: { connections: from_user_id } });

        // Delete connection document
        await connection.deleteOne();

        return NextResponse.json({ success: true, message: "Connection removed" });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, message: errMessage });
    }

}