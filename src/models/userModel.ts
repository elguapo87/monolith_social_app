import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    email: { type: String, required: true },
    full_Name: { type: String, required: true },
    user_name: { type: String, unique: true },
    bio: { type: String, default: "Hey there! I am using Monolith." },
    profile_picture: { type: String, default: "" },
    cover_photo: { type: String, default: "" },
    location: { type: String, default: "" },
    followers: [{ type: String, ref: "user" }],
    following: [{ type: String, ref: "user" }],
    connections: [{ type: String, ref: "user" }]
    
}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel