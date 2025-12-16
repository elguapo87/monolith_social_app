import { protectUser } from "@/middleware/userAuth";
import commentModel from "@/models/commentModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" });
        }

        const { text } = await req.json();
        const { post_id } = await req.json();

        const newComment = await commentModel.create({
            user_id: user._id,
            post_id,
            text
        });

        return NextResponse.json({ success: true, comment: newComment });

    } catch (error) {
        const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(error);
        return NextResponse.json({ success: false, message: errMesage });        
    }
}