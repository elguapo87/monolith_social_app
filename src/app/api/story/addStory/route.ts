import imageKit from "@/config/imageKit";
import { protectUser } from "@/middleware/userAuth";
import storyModel from "@/models/storyModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user: authUser } = await protectUser();
        if (!authorized || !authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const form = await req.formData();
        const content = form.get("content") as string | null;
        const background_color = form.get("background_color") as string | null;
        const mediaFile = form.get("media") as File | null;

        if (!content && !mediaFile) {
            return NextResponse.json(
                { success: false, message: "Story must contain text or media." },
                { status: 400 }
            );
        }

        let media_url: string | null = null;
        let media_type: "text" | "image" | "video" = "text";

        if (mediaFile) {
            const fileBytes = await mediaFile.arrayBuffer();
            const buffer = Buffer.from(fileBytes);

            const isImage = mediaFile.type.startsWith("image/")
            const isVideo = mediaFile.type.startsWith("video/")

            if (!isImage && !isVideo) {
                return NextResponse.json(
                    { success: false, message: "Unsupported media type." },
                    { status: 400 }
                );
            }

            const uploadRes = await imageKit.upload({
                file: buffer,
                fileName: `story_${authUser._id}_${Date.now()}`,
                folder: "/monolith/stories"
            });

            if (isImage) {
                media_url = imageKit.url({
                    src: uploadRes.url,
                    transformation: [
                        { quality: "auto" },
                        { format: "webp" },
                        { width: "1280" }
                    ]
                });

                media_type = "image";
            }

            if (isVideo) {
                media_url = uploadRes.url;
                media_type = "video";
            }
        }

        if (!mediaFile) {
            media_type = "text";
        }

        const createdStory = storyModel.create({
            user: authUser._id,
            content: content || "",
            media_url,
            media_type,
            background_color: background_color || "",
            view_count: []
        });

        return NextResponse.json({
            success: true,
            message: "Story created successfully",
            data: createdStory
        });

    } catch (error) {
        console.error("Add story error:", error);
        return NextResponse.json(
            { success: false, message: "Failed create story" },
            { status: 500 }
        );
    }
}