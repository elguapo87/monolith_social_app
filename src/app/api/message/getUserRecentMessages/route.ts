import { protectUser } from "@/middleware/userAuth";
import messageModel from "@/models/messageModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const recentConversations = await messageModel.aggregate([
            // Only messages involving current user
            {
                $match: {
                    $or: [
                        { from_user_id: user._id },
                        { to_user_id: user._id }
                    ]
                }
            },

            // Determine the "other user" in the conversation
            {
                $addFields: {
                    other_user_id: {
                        $cond: [
                            { $eq: ["$from_user_id", user._id] },
                            "$to_user_id",
                            "$from_user_id"
                        ]
                    }
                }
            },

            // Sort so newest messages come first
            { $sort: { createdAt: -1 } },

            // Group by conversation (other user)
            {
                $group: {
                    _id: "$other_user_id",
                    latestMessage: { $first: "$$ROOT" }
                }
            },

            // Sort conversations by latest message time
            { $sort: { "latestMessage.createdAt": -1 } },

            // Limit to 5 conversations
            { $limit: 5 },

            // Lookup other user's info
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },

            // Count unread messages from that user
            {
                $lookup: {
                    from: "messages",
                    let: { otherUserId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$from_user_id", "$$otherUserId"] },
                                        { $eq: ["$to_user_id", user._id] },
                                        { $eq: ["$seen", false] }
                                    ]
                                }
                            }
                        },
                        { $count: "count" }
                    ],
                    as: "unread"
                }
            },

            // Shape final response
            {
                $project: {
                    _id: 0,

                    user: {
                        _id: "$user._id",
                        full_name: "$user.full_name",
                        profile_picture: "$user.profile_picture"
                    },

                    message_type: "$latestMessage.message_type",
                    latest_message: {
                        $cond: [
                            { $eq: ["$latestMessage.message_type", "text"] },
                            "$latestMessage.text",
                            "Media"
                        ]
                    },
                    media_url: "$latestMessage.media_url",

                    latest_created_at: "$latestMessage.createdAt",

                    unread_count: {
                        $ifNull: [{ $arrayElemAt: ["$unread.count", 0] }, 0]
                    },

                    is_unread: {
                        $gt: [
                            { $ifNull: [{ $arrayElemAt: ["$unread.count", 0] }, 0] },
                            0
                        ]
                    }
                }
            }

        ]);

        return NextResponse.json({ success: true, recent_messages: recentConversations });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ success: false, message: errMessage }, { status: 500 });
    }
}
