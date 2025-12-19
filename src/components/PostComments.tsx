import { Send } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react"
import { assets } from "../../public/assets";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useAuth } from "@clerk/nextjs";
import { addComment, fetchComments } from "@/redux/slices/commentSlice";
import moment from "moment";

const PostComments = ({ postId }: { postId: string }) => {

    const { comments, loading } = useSelector((state: RootState) => state.comments)
    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();

    const [showComments, setShowComments] = useState(false);
    const [text, setText] = useState("");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await getToken();

        if (!text.trim()) return;

        dispatch(addComment({ post_id: postId, text, token }));
        setText("");
    };

    useEffect(() => {
        getToken().then((token: string | null) => {
            dispatch(fetchComments(token));
        });
    }, [postId]);

    return (
        <div className="mt-2">
            {/* Toggle button */}
            <button
                onClick={() => setShowComments(prev => !prev)}
                className="text-xs text-indigo-600 font-medium cursor-pointer"
            >
                {showComments ? "Hide comments" : "View comments"}
            </button>

            {showComments && (
                <div className="mt-3 border-t border-gray-200 pt-3 space-y-3">
                    {/* Comment form */}
                    <form onSubmit={handleCreate} className="flex items-center gap-1">
                        <input
                            onChange={(e) => setText(e.target.value)}
                            value={text}
                            type="text"
                            placeholder="Write a comment..."
                            className="flex-1 border border-gray-300 rounded-full px-3 py-1
                                text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <button
                            type="submit"

                            className="p-1 text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                            <Send className="size-4" />
                        </button>
                    </form>

                    {/* Comments list */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {comments.length === 0 && (
                            <p className="text-gray-400 text-xs text-center">No comments yet.</p>
                        )}

                        {comments.map((comment) => (
                            <div key={comment._id} className="flex items-center gap-2">
                                <Image 
                                    src={comment.user_id.profile_picture || assets.avatar_icon}
                                    alt=""
                                    width={24}
                                    height={24}
                                    className="size-6 aspect-square rounded-full"
                                />
                                <div className="bg-gray-100 rounded-lg px-3 py-1.5 text-sm flex items-start gap-3">
                                    <div className="flex flex-col items-start justify-center">
                                        <span className="font-medium text-gray-800">{comment.user_id.full_name}</span>{" "}
                                        <span 
                                            className="text-[10px] font-light text-gray-600 -mt-0.5">
                                            {moment(comment.createdAt).fromNow()}
                                        </span>
                                    </div>
                                    <span className="text-gray-700">{comment.text}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default PostComments
