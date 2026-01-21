import { protectUser } from "@/middleware/userAuth";
import connectionModel from "@/models/connectionModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized && !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { connectionId } = await req.json();
        if (!connectionId) {
            return NextResponse.json({ success: false, message: "Connection ID is missing" }, { status: 404 });
        }

        await connectionModel.findOneAndDelete({
            from_user_id: user._id,
            _id: connectionId 
        });

        return NextResponse.json({ success: true, message: "Connection request canceled" });
       
    } catch (error) {
        const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(error);
        return NextResponse.json({ success: false, message: errMesage });
    }
}
