import connectDB from "@/config/db";
import userModel from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const protectUser = async () => {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { authorized: false, user: null };
        }

        await connectDB();

        // Check if user exists in DB
        const user = await userModel.findById(userId);
        if (!user) {
            return { authorized: false, user: null };
        }

        return { authorized: true, userId };

    } catch (error) {
        console.error("protectUser error:", error);
        return { authorized: false, user: null };
    }
};