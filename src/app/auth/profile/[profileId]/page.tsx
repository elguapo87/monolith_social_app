"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { assets } from "../../../../../public/assets";
import Loading from "@/components/Loading";
import Image from "next/image";
import UserProfileInfo from "@/components/UserProfileInfo";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import moment from "moment";
import ProfileModal from "@/components/ProfileModal";
import { useProfile } from "@/hooks/useProfile";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useAuth } from "@clerk/nextjs";
import { fetchLikedPosts } from "@/redux/slices/postSlice";

const Profile = () => {

    const { profileId } = useParams() as { profileId: string };

    const { user, posts, loading } = useProfile(profileId);

    const likedPosts = useSelector((state: RootState) => state.post.likedPosts);
    const currentUser = useSelector((state: RootState) => state.user.value);
    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();

    const [activeTab, setActiveTab] = useState("posts");
    const [showEdit, setShowEdit] = useState(false);

    const otherProfile = user?._id === profileId;

    // const userData = posts[0]?.user;
    const userData = otherProfile ? user : posts[0]?.user;
    const isCurrentProfile = currentUser?._id === profileId;

    useEffect(() => {
        if (!otherProfile) return;
        if (activeTab !== "likes") return;

        getToken().then((token) => {
            dispatch(fetchLikedPosts(token));
        });
    }, [activeTab, otherProfile, dispatch, getToken]);

    if (loading) return <Loading />

    if (!user) {
        return <p>User not found</p>;
    }

    if (!userData) return <Loading />;
          
    return (
        <div className="relative h-full overflow-y-scroll bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                {/* PROFILE CARD */}
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    {/* COVER PHOTO */}
                    <div
                        className="relative h-40 md:h-56 bg-linear-to-r from-indigo-200
                            via-purple-200 to-pink-200"
                    >
                        <Image
                            src={userData?.cover_photo || assets.image_placeholder}
                            fill
                            alt="Cover Photo"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* USER INFO */}
                    <UserProfileInfo
                        user={userData}
                        posts={posts}
                        setShowEdit={setShowEdit}
                    />
                </div>

                {/* TABS */}
                <div className="mt-6">
                    <div className="bg-white rounded-xl shadow p-1 flex max-w-md mx-auto">
                        {["posts", "media", ...(isCurrentProfile ? ["likes"] : [])].map((tab) => (
                            <button
                                onClick={() => setActiveTab(tab)}
                                key={tab}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                                    cursor-pointer ${activeTab === tab ?
                                        "bg-indigo-600 text-white" :
                                        "text-gray-600 hover:text-gray-900"}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* POSTS */}
                {activeTab === "posts" && (
                    <div className="mt-6 flex flex-col items-center gap-6">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard key={post._id} post={post} />
                            ))
                        ) : (
                            <p className="text-center text-slate-500 w-full">
                                There are no posts yet.
                            </p>
                        )}
                    </div>
                )}

                {/* MEDIA */}
                {activeTab === "media" && (
                    <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-6xl mx-auto">
                        {posts.some(post => post.image_urls.length > 0) ? (
                            posts.flatMap(post =>
                                post.image_urls.map((image, index) => (
                                    <Link
                                        href={image}
                                        key={`${post._id}-${index}`}
                                        target="_blank"
                                        className="relative group"
                                    >
                                        <Image
                                            src={image}
                                            alt="Post image"
                                            width={256}
                                            height={256}
                                            className="w-64 aspect-video object-cover rounded-lg"
                                        />

                                        <p
                                            className="absolute bottom-0 right-0 text-xs p-1 px-3
                                                backdrop-blur-xl text-white opacity-0
                                                group-hover:opacity-100 transition duration-300"
                                        >
                                            Posted {moment(post.createdAt).fromNow()}
                                        </p>
                                    </Link>
                                ))
                            )
                        ) : (
                            <p className="text-center text-slate-500 w-full">
                                There are no posts with images yet.
                            </p>
                        )}
                    </div>
                )}

                {isCurrentProfile && activeTab === "likes" && (
                    <div className="mt-6 flex flex-col items-center gap-6">
                        {likedPosts.length > 0 ? (
                            likedPosts.map((post) => (
                                <PostCard key={post._id} post={post} />
                            ))
                        ) : (
                            <p className="text-center text-slate-500 w-full">
                                There are no liked posts yet.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* EFIT PROFILE MODAL */}
            {showEdit && (
                <ProfileModal setShowEdit={setShowEdit} />
            )}
        </div>
    )
}

export default Profile



