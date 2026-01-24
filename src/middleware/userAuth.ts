import connectDB from "@/config/db";
import userModel from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";

export const protectUser = async () => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { authorized: false, user: null };
        }

        await connectDB();

        const user = await userModel.findById(userId);
        if (!user) {
            // User not provisioned yet
            return { authorized: false, user: null };
        }

        return { authorized: true, user };
    } catch (error) {
        console.error("protectUser error:", error);
        return { authorized: false, user: null };
    }
};
