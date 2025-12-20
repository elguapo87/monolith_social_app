import { assets } from "../../public/assets"
import Image from "next/image";
import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useAuth } from "@clerk/nextjs";
import { toggleLike } from "@/redux/slices/postSlice";
import type { Post } from "@/redux/slices/postSlice";
import { useEffect, useState } from "react";
import PostComments from "./PostComments";
import { fetchCommentCount } from "@/redux/slices/commentSlice";
import toast from "react-hot-toast";
import PostModal from "./PostModal";


const PostCard = ({ post }: { post: Post }) => {

    const postWithHashtags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>');

    const commentCount = useSelector((state: RootState) => state.comments.commentCount[post._id] ?? 0);
    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();

    const likes = post.likes_count;
    const currentUser = useSelector((state: RootState) => state.user.value);

    const router = useRouter();

    const [showComments, setShowComments] = useState(false);
    const [showPost, setShowPost] = useState(false);

    const handleLike = async () => {
        const token = await getToken();
        if (!token || !currentUser?._id) return;
        dispatch(toggleLike({ postId: post._id, userId: currentUser._id, token }));
    };

    const handleShare = async (postId: string) => {
        const postUrl = `${window.location.origin}/auth/post/${postId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Check out this post!",
                    text: "I found this post interesting:",
                    url: postUrl
                });

            } catch (err) {
                console.log("Share cancelled or failed:", err);
            }

        } else {
            navigator.clipboard.writeText(postUrl);
            toast.success("Post link copied to clipboard!");
        }
    };

    useEffect(() => {
        const load = async () => {
            const token = await getToken();
            dispatch(fetchCommentCount({ postId: post._id, token }))
        };

        load();
    }, [post._id]);

    return (
        <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
            {/* USER INFO */}
            <div 
                onClick={() => router.push(`/auth/profile/${post.user._id}`)}
                className="inline-flex items-center gap-3 cursor-pointer"
            >
                <Image 
                    src={post.user.profile_picture || assets.avatar_icon} 
                    alt=""
                    width={40}
                    height={40} 
                    className="w-10 h-10 aspect-square rounded-full shadow"
                />

                <div>
                    <div className="flex items-center space-x-1">
                        <span>{post.user.full_name}</span>
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                    </div>

                    <div className="text-gray-500 text-sm">
                        @{post.user.user_name} &bull; {moment(post.createdAt).fromNow()}
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            {post.content && (
                <div
                    onClick={() => setShowPost(true)}
                    className="text-gray-800 text-sm whitespace-pre-line cursor-pointer"
                    dangerouslySetInnerHTML={{__html: postWithHashtags}}
                />
            )}

            {/* IMAGES */}
            <div className="grid grid-cols-2 gap-2 cursor-pointer" onClick={() => setShowPost(true)}>
                {post.image_urls.map((img, index) => (
                    <Image 
                        key={index}
                        src={img}
                        alt=""
                        width={192}
                        height={192}
                        className={`w-full h-48 object-cover rounded-lg 
                            ${post.image_urls.length === 1 && "col-span-2 h-auto"}`}
                    />
                ))}
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
                <div className="flex items-center gap-1">
                    <Heart 
                        onClick={handleLike}
                        className={`w-4 h-4 cursor-pointer 
                            ${likes.includes(currentUser?._id ?? "") && "text-red-500 fill-red-500"}`} 
                    />
                    <span>{likes.length}</span>
                </div>

                <div 
                    className="flex items-center gap-1 cursor-pointer" 
                    onClick={() => setShowComments(prev => !prev)}
                >
                    <MessageCircle  className="w-4 h-4" />
                    <span>{commentCount}</span>
                </div>

                <div className="flex items-center gap-1">
                    <Share2 onClick={() => handleShare(post._id)} className="w-4 h-4" />
                </div>
            </div>

            {showComments && <PostComments postId={post._id} />}

            {/* SHOW SINGLE POST */}
            {showPost && <PostModal setShowPost={setShowPost} singlePost={post} />}
        </div>
    )
}

export default PostCard
