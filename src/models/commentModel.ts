import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user_id: { type: String, ref: "user", required: true },
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: "post", required: true },
    text: { type: String }
}, { timestamps: true });

const commentModel = mongoose.models.comment || mongoose.model("comment", commentSchema);

export default commentModel;