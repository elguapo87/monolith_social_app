import { protectUser } from "@/middleware/userAuth";
import connectionModel from "@/models/connectionModel";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { authorized, user: authUser } = await protectUser();
        if (!authorized || !authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const user = await userModel.findById(authUser._id).populate("connections followers following");

        const connections = user.connections;
        const followers = user.followers;
        const following = user.following;

        const pendingConnections = (await connectionModel.find({
            to_user_id: authUser._id, status: "pending"
        }).populate("from_user_id")).map((connection) => connection.from_user_id);

        const pendingSent = (await connectionModel.find({
            from_user_id: authUser._id,
            status: "pending"
        }).populate("to_user_id")).map((connection) => connection.to_user_id);

        return NextResponse.json({ 
            success: true,
            connections,
            followers, 
            following, 
            pendingConnections,  // incoming 
            pendingSent  // outgoing 
        });

    } catch (error) {
        const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(error);
        return NextResponse.json({ success: false, message: errMesage });
    }
};