import { useState } from "react";
import { assets, dummyPostsData, dummyUserData } from "../../public/assets"
import Image from "next/image";
import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";

type PostType = typeof dummyPostsData[number];

const PostCard = ({ post }: { post: PostType }) => {

    const postWithHashtags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>');

    const [likes, setLikes] = useState(post.likes_count);
    const currentUser = dummyUserData;

    const router = useRouter();

    const handleLike = async () => {};

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
                        @{post.user.username} &bull; {moment(post.createdAt).fromNow()}
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            {post.content && (
                <div
                    className="text-gray-800 text-sm whitespace-pre-line"
                    dangerouslySetInnerHTML={{__html: postWithHashtags}}
                />
            )}

            {/* IMAGES */}
            <div className="grid grid-cols-2 gap-2">
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
                            ${likes.includes(currentUser._id) && "text-red-500 fill-red-500"}`} 
                    />
                    <span>{likes.length}</span>
                </div>

                <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{12}</span>
                </div>

                <div className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    <span>{7}</span>
                </div>
            </div>
        </div>
    )
}

export default PostCard
