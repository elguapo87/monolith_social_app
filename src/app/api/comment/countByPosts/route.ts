import { protectUser } from "@/middleware/userAuth";
import commentModel from "@/models/commentModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" });
        }

        const { postIds } = await req.json();
        if (!Array.isArray(postIds) || postIds.length === 0) {
            return NextResponse.json({ success: false, message: "postIds must be a non-empty array" }, { status: 400 });
        }

        const counts = await commentModel.aggregate([
            {
                $match: {
                    post_id: { $in: postIds }
                }
            },
            {
                $group: {
                    _id: "$post_id",
                    count: { $sum: 1 }
                }
            }
        ]);

        const result: Record<string, number> = {};
        postIds.forEach((id) => (result[id] = 0));

        counts.forEach((item) => {
            result[item._id] = item.count;
        });

        return NextResponse.json({ success: true, counts: result });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}