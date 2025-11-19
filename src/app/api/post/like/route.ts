import { protectUser } from "@/middleware/userAuth";
import postModel from "@/models/postModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await req.json();

        const post = await postModel.findById(postId);

        if (post.likes_count.includes(user._id)) {
            post.likes_count.pull(user._id);
            await post.save();
            return NextResponse.json({ success: true, message: "Post unliked" });

        } else {
            post.likes_count.push(user._id);
            await post.save();
            return NextResponse.json({ success: true, message: "Post liked" });
        }


    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.log(error);
        return NextResponse.json({ success: false, message: errMessage });
    }
}