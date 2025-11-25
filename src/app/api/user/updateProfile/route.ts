import imageKit from "@/config/imageKit";
import { protectUser } from "@/middleware/userAuth";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { authorized, user } = await protectUser();
        if (!authorized || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const form = await req.formData();

        let full_name = form.get("full_name") as string;
        let user_name = form.get("user_name") as string;
        let bio = form.get("bio") as string;
        let location = form.get("location") as string;

        const tempUser = await userModel.findById(user._id);
        if (!tempUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        if (user_name && user_name !== tempUser.user_name) {
            const userExists = await userModel.findOne({ user_name });
            if (userExists) {
                return NextResponse.json({
                    success: false, message: "Username already taken."
                }, { status: 404 });
            }

        } else {
            user_name = tempUser.user_name;
        }

        let profile_picture = tempUser.profile_picture;
        let cover_photo = tempUser.cover_photo;

        const profileFile = form.get("profile") as File | null;
        const coverFile = form.get("cover") as File | null;

        if (profileFile && profileFile.size > 0) {
            const bytes = await profileFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uploadResponse = await imageKit.upload({
                file: buffer,
                fileName: `profile_${user._id}_${Date.now()}.jpg`,
                folder: "/monolith/profiles"
            });

            profile_picture = imageKit.url({
                src: uploadResponse.url,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { width: "512" }
                ]
            })
        }

        if (coverFile && coverFile.size > 0) {
            const bytes = await coverFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uploadResponse = await imageKit.upload({
                file: buffer,
                fileName: `cover_${user._id}_${Date.now()}.jpg`,
                folder: "/monolith/covers"
            });
            cover_photo = imageKit.url({
                src: uploadResponse.url,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { width: "1280" }
                ]
            });
        }

        const updateData = {
            _id: user._id,
            full_name: full_name || tempUser.full_name,
            user_name,
            bio: bio || tempUser.bio,
            location: location || tempUser.location,
            profile_picture,
            cover_photo
        };

        await userModel.findByIdAndUpdate(user._id, updateData, { new: true });

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            data: updateData
        });

    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update profile" },
            { status: 500 }
        );
    }
};


