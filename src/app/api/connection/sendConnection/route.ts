import { protectUser } from "@/middleware/userAuth";
import connectionModel from "@/models/connectionModel";
import { NextResponse } from "next/server";
import { sendAppEvent } from "@/inngest/client";

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
            });

            await sendAppEvent("app/connection-request", {
                data: { connectionId: newConnection._id }
            });

            return NextResponse.json({ success: true, message: "Connection request sent successfully" });

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