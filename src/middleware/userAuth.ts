import connectDB from "@/config/db";
import userModel from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";

export const protectUser = async () => {
    const { userId } = await auth();
    if (!userId) {
        return { authorized: false, user: null }
    }

    await connectDB();

    const user = await userModel.findById(userId);
    if (!user) {
        return { authorized: false, user: null }
    }

    return { authorized: true, user };
};