import imageKit from "@/config/imageKit";
import { protectUser } from "@/middleware/userAuth";
import postModel from "@/models/postModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const form = await req.formData();
        const content = form.get("content") as string | null;
        const imageFiles = form.getAll("images") as File[];

        if (!content && imageFiles.length === 0) {
            return NextResponse.json(
                { success: false, message: "Post must contain text or images."}, 
                { status: 400 }
            );
        }

        const image_urls: string[] = [];

        for (const file of imageFiles) {
            if (!(file instanceof File) || file.size === 0) continue;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uploaded = await imageKit.upload({
                file: buffer,
                fileName: `post_${user._id}_${Date.now()}.jpg`,
                folder: "/monolith/posts"
            });

            const optimizedUrl = imageKit.url({
                src: uploaded.url,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { width: "1280" }
                ]
            });

            image_urls.push(optimizedUrl);
        }

        let post_type: "text" | "image" | "text_with_image" = "text";

        if (content && image_urls.length > 0) post_type = "text_with_image"
        else if (content && image_urls.length === 0) post_type = "text"
        else if (!content && image_urls.length > 0) post_type = "image"

        const post = await postModel.create({
            user: user._id,
            content: content || "",
            image_urls,
            post_type
        });

        return NextResponse.json({
            success: true,
            message: "Post created",
            post
        });

    } catch (error) {
        console.error("Add post error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to create post" },
            { status: 500 }
        );
    }
}