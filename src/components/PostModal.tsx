"use client"

import { fetchCommentCount } from "@/redux/slices/commentSlice";
import { getPostById, toggleLike, type Post } from "@/redux/slices/postSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useAuth } from "@clerk/nextjs";
import { BadgeCheck, Heart, MessageCircle, Share2, X } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { assets } from "../../public/assets";
import PostComments from "./PostComments";

type Props = {
    setShowPost?: React.Dispatch<React.SetStateAction<boolean>>;
    singlePost?: Post;
    postId?: string;
    fullPage?: boolean;
}

const PostModal = ({ setShowPost, singlePost, postId, fullPage }: Props) => {

    const currentUser = useSelector((state: RootState) => state.user.value);
    const post = useSelector((state: RootState) =>
        postId
            ? state.post.posts.find((p) => p._id === postId)
            : singlePost ?? null
    );

    const resolvedPostId = post?._id ?? postId;

    const commentCount = useSelector((state: RootState) =>
        resolvedPostId ? state.comments.commentCount[resolvedPostId] ?? 0 : 0
    );

    const { getToken } = useAuth();
    const dispatch = useDispatch<AppDispatch>();
    
    const [showComments, setShowComments] = useState(false);

    const likes = post?.likes_count;

    // Fetch post if it's opened in fullPage mode
    useEffect(() => {
        if (!postId || post) return;

        getToken().then((token) => {
            dispatch(getPostById({ postId, token }));
        })

    }, [postId, post]);

    useEffect(() => {
        if (!post?._id) return;

        getToken().then((token) => {
            dispatch(fetchCommentCount({ postId: post._id, token }));
        });
    }, [post?._id]);

    const postWithHashtags = post?.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>');

    const handleLike = async () => {
        if (!post?._id || !currentUser?._id) return;

        const token = await getToken();
        if (!token) return;
        dispatch(toggleLike({ postId: post?._id, userId: currentUser._id, token }))
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

    return (
        <div
            className={`${fullPage
                ? "min-h-screen bg-gray-50 text-black flex justify-center p-6"
                : "fixed inset-0 z-110 min-h-screen bg-black/90 backdrop-blur text-white flex justify-center p-4"
                }`}
        >
            <div
                className={`relative w-full max-w-xl md:max-w-3xl bg-stone-100 rounded-md
                    ${fullPage ? "shadow-xl" : "max-h-screen"}`}
            >
                {!fullPage && setShowPost && (
                    <button onClick={() => setShowPost(false)}
                        className='absolute top-3 right-3 cursor-pointer text-black'
                    >
                        <X />
                    </button>
                )}

                {/* POST AUTHOR */}
                <div className='flex items-center gap-1 mt-5 px-5 md:px-10'>
                    <Image
                        src={post?.user.profile_picture || assets.avatar_icon}
                        alt=""
                        width={50}
                        height={50}
                        className='size-12.5 rounded-full aspect-square shadow'
                    />
                    <div>
                        <div className="flex items-center space-x-1">
                            <span className="text-gray-800">{post?.user.full_name}</span>
                            <BadgeCheck className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-gray-500 text-sm">
                            @{post?.user.user_name} &bull; {moment(post?.createdAt).fromNow()}
                        </div>
                    </div>
                </div>

                <hr className='w-full text-gray-300 my-3' />

                {/* POST CONTENT */}
                <div className='overflow-y-scroll max-h-[30vh] md:max-h-[45vh]'>
                    <div
                        {...(!fullPage && setShowPost ? { onClick: () => setShowPost(true) } : {})}
                        className="text-gray-800 px-5 md:px-10 text-base whitespace-pre-line cursor-pointer"
                        dangerouslySetInnerHTML={{ __html: postWithHashtags ?? "" }}
                    />

                    {/* IMAGES */}
                    <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-2 cursor-pointer px-5 md:px-10 mt-3"
                        onClick={() => setShowPost && setShowPost(true)}
                    >
                        {post?.image_urls.map((img, index) => (
                            <Image
                                key={index}
                                onClick={() => window.open(img)}
                                src={img}
                                alt=""
                                width={500}
                                height={500}
                                className={`w-full h-48 object-cover rounded-lg 
                                    ${post.image_urls.length === 1 && "col-span-2 h-auto"}`}
                            />
                        ))}
                    </div>
                </div>

                {/* ACTIONS */}
                <div
                    className="px-5 md:px-10 flex items-center gap-4 text-gray-600 text-sm pt-2
                        mt-2 border-t border-gray-300"
                >
                    <div className="flex items-center gap-1">
                        <Heart
                            onClick={handleLike}
                            className={`w-4 h-4 cursor-pointer 
                            ${likes?.includes(currentUser?._id ?? "") && "text-red-500 fill-red-500"}`}
                        />
                        <span>{likes?.length}</span>
                    </div>

                    <div className="flex items-center gap-1" >
                        <MessageCircle
                            onClick={() => setShowComments(prev => !prev)}
                            className="w-4 h-4 cursor-pointer"
                        />
                        <span>{commentCount}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Share2 onClick={() => post && handleShare(post._id)} className="w-4 h-4" />
                    </div>
                </div>

                {showComments && post && (
                    <div className='px-5 md:px-10 text-gray-800'>
                        <PostComments postId={post._id} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default PostModal
