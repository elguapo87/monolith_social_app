import { pusherServer } from "@/lib/pusher/server";
import { protectUser } from "@/middleware/userAuth";
import connectionModel from "@/models/connectionModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user: authUser } = await protectUser();
        if (!authorized || !authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();

        const connection = await connectionModel.findOne({
            from_user_id: id,
            to_user_id: authUser._id,
            status: "pending"
        })
            .populate("to_user_id", "full_name profile_picture");

        if (!connection) {
            return NextResponse.json({ success: false, message: "Pending connection not found" }, { status: 404 });
        }

        await pusherServer.trigger(
            `user-${connection.from_user_id}`,
            "connection-declined",
            {
                connectionId: connection._id,
                createdAt: new Date().toISOString(),
                user: {
                    id: authUser._id,
                    full_name: authUser.full_name,
                    profile_picture: authUser.profile_picture
                }
            }
        );

        await connectionModel.deleteOne({ _id: connection._id });

        return NextResponse.json({ success: true, message: "Connection request rejected" });

    } catch (error) {
        const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(error);
        return NextResponse.json({ success: false, message: errMesage }, { status: 500 });
    }

}