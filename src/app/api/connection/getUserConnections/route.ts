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

        const acceptedConnections = await connectionModel.find({
            $or: [
                { from_user_id: authUser._id },
                { to_user_id: authUser._id }
            ],
            status: "accepted"
        }).populate("from_user_id to_user_id");

        // Map to a normalized structure so you have connectionId and the other user
        const connectionsWithId = acceptedConnections.map((conn) => {
            const otherUser = conn.from_user_id._id === authUser._id ? conn.to_user_id : conn.from_user_id;
            return {
                _id: otherUser._id,
                full_name: otherUser.full_name,
                email: otherUser.email,
                user_name: otherUser.user_name,
                bio: otherUser.bio,
                profile_picture: otherUser.profile_picture,
                followers: otherUser.followers,
                following: otherUser.following,
                connections: otherUser.connections,
                connectionId: conn._id
            }
        });

        const followers = user.followers;
        const following = user.following;

        // INCOMING
        const pendingConnections = await connectionModel.find({
            to_user_id: authUser._id,
            status: "pending"
        }).populate("from_user_id");

        // OUTGOING
        const pendingSent = await connectionModel.find({
            from_user_id: authUser._id,
            status: "pending"
        }).populate("to_user_id");

        return NextResponse.json({
            success: true,
            connections: connectionsWithId,
            followers,
            following,
            pendingConnections,  // incoming 
            pendingSent,  // outgoing 
        });

    } catch (error) {
        const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(error);
        return NextResponse.json({ success: false, message: errMesage });
    }
};