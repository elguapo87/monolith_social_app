import { protectUser } from "@/middleware/userAuth";
import commentModel from "@/models/commentModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized } = await protectUser();
        if (!authorized) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { postIds } = await req.json();

        if (!Array.isArray(postIds) || postIds.length === 0) {
            return NextResponse.json(
                { success: false, message: "postIds must be a non-empty array" },
                { status: 400 }
            );
        }

        // Convert to ObjectIds
        const objectIds = postIds
            .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
            .map((id: string) => new mongoose.Types.ObjectId(id));

        const counts = await commentModel.aggregate([
            {
                $match: {
                    post_id: { $in: objectIds }
                }
            },
            {
                $group: {
                    _id: "$post_id",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Normalize result
        const result: Record<string, number> = {};
        postIds.forEach((id: string) => {
            result[id] = 0;
        });

        counts.forEach((item) => {
            result[item._id.toString()] = item.count;
        });

        return NextResponse.json({
            success: true,
            counts: result
        });

    } catch (err) {
        console.error("countByPosts error:", err);
        return NextResponse.json(
            { success: false, message: "Failed to fetch comment counts" },
            { status: 500 }
        );
    }
}
