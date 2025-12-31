import { protectUser } from "@/middleware/userAuth";
import connectionModel from "@/models/connectionModel";
import { NextResponse } from "next/server";
import { sendInngestEvent } from "@/lib/inngestHttpSender";
import { pusherServer } from "@/lib/pusher/server";
import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const { id } = body

        // Check if user has sent more then 20 connection requests in the last 24 hr 
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const connecitonRequests = await connectionModel.find({
            from_user_id: user._id, createdAt: { $gt: last24Hours }
        });

        if (connecitonRequests.length >= 20) {
            return NextResponse.json({
                success: false,
                message: "You have sent more then 20 connection requests in the last 24 hours"
            });
        }

        // Check of users are already connected
        const connection = await connectionModel.findOne({
            $or: [
                { from_user_id: user._id, to_user_id: id },
                { from_user_id: id, to_user_id: user._id }
            ]
        });

        if (!connection) {
            const newConnection = await connectionModel.create({
                from_user_id: user._id,
                to_user_id: id,
            })
                .then(conn =>
                    conn.populate("from_user_id", "full_name user_name bio profile_picture")
                );

            try {
                // await sendInngestEvent("app/connection-request", {
                //     data: { connectionId: newConnection._id.toString() }
                // });

                await inngest.send({
                    name: "app/connection-request",
                    data: {
                        connectionId: newConnection._id.toString()
                    }
                });

            } catch (err) {
                console.error("Failed to send inngest event:", err);
            }

            // Fire realtime notification (this MUST succeed fast)
            await pusherServer.trigger(`user-${id}`, "connection-request", {
                _id: newConnection._id,
                from_user_id: newConnection.from_user_id,
                to_user_id: { _id: id },
                status: "pending",
                createdAt: newConnection.createdAt
            });

            return NextResponse.json({ success: true, message: "Connection request sent", connection: newConnection });

        } else if (connection && connection.status === "accepted") {
            return NextResponse.json({ success: false, message: "You already connected with this user" });
        }

        return NextResponse.json({ success: false, message: "Connection request pending" });

    } catch (error) {
        const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(error);
        return NextResponse.json({ success: false, message: errMesage });
    }
}