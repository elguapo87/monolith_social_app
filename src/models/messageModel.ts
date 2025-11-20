import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    from_user_id: { type: String, ref: "user", required: true },
    to_user_id: { type: String, ref: "user", required: true },
    text: { type: String, trim: true },
    message_type: { type: String, enum: ["text", "image"] },
    media_url: { type: String }

}, { timestamps: true });

const messageModel = mongoose.models.message || mongoose.model("message", messageSchema);

export default messageModel;
