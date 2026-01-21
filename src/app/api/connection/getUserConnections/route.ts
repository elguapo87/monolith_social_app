import { protectUser } from "@/middleware/userAuth";
import connectionModel from "@/models/connectionModel";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

interface UserData {
    _id: string;
    full_name: string;
    user_name: string;
    profile_picture: string;
    location: string;
    bio: string;
    followers: [];
};

interface User {
    user: UserData,
    connectionId?: string;
    type: "follower" | "following" | "pending_sent" | "pending_received" | "connection";
};

const mapUser = (u: UserData) => ({
    _id: u._id,
    full_name: u.full_name,
    user_name: u.user_name,
    profile_picture: u.profile_picture,
    location: u.location,
    bio: u.bio,
    followers: u.followers
});

export async function GET() {
    try {
        const { authorized, user: authUser } = await protectUser();
        if (!authorized || !authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const user = await userModel.findById(authUser._id).populate("connections followers following");
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
        }

        const followers: User[] = user.followers.map((u: UserData) => ({
            user: mapUser(u),
            type: "follower"
        }));

        const following: User[] = user.following.map((u: UserData) => ({
            user: mapUser(u),
            type: "following"
        }));

        const acceptedConnections = await connectionModel.find({
            $or: [
                { from_user_id: authUser._id },
                { to_user_id: authUser._id }
            ],
            status: "accepted"
        })
            .populate("from_user_id to_user_id");

        const connections: User[] = acceptedConnections.map((conn) => {
            const otherUser = conn.from_user_id._id === authUser._id ? conn.to_user_id : conn.from_user_id;

            return {
                user: mapUser(otherUser),
                connectionId: conn._id,
                type: "connection"
            }
        });

        const pendingSentRaw = await connectionModel.find({
            from_user_id: authUser._id,
            status: "pending"
        })
            .populate("to_user_id");

        const pendingSent: User[] = pendingSentRaw.map((conn) => ({
            user: mapUser(conn.to_user_id),
            connectionId: conn._id,
            type: "pending_sent"
        }));

        const pendingConnectionsRaw = await connectionModel.find({
            to_user_id: authUser._id,
            status: "pending"
        })
            .populate("from_user_id");

        const pendingConnections: User[] = pendingConnectionsRaw.map((conn) => ({
            user: mapUser(conn.from_user_id),
            connectionId: conn._id, 
            type: "pending_received"
        }));

        return NextResponse.json({
            success: true,
            connections,
            followers,
            following,
            pendingSent,
            pendingConnections
        })

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(error);
        return NextResponse.json({ success: false, message: errMessage });
    }
}