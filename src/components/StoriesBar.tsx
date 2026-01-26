"use client"

import { useEffect, useState } from "react"
import { assets } from "../../public/assets";
import { Plus } from "lucide-react";
import Image from "next/image";
import moment from "moment";
import StoryModal from "./StoryModal";
import StoryViewer from "./StoryViewer";
import { useAuth } from "@clerk/nextjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchStories } from "@/redux/slices/storySlice";

type StoriesType = {
   _id: string
    user: {
        _id: string;
        full_name: string;
        profile_picture?: string;
    }
    content: string;
    media_url: string
    media_type: string
    background_color: string
    createdAt?: Date;
    updatedAt?: Date;
    view_count?: string[];
}

const StoriesBar = () => {
    const { getToken } = useAuth();
    const stories = useSelector((state: RootState) => state.story.stories);
    const dispatch = useDispatch<AppDispatch>();

    const [showModal, setShowModal] = useState(false);
    const [viewStory, setViewStory] = useState<StoriesType | null>(null);

    useEffect(() => {
        getToken().then((token) => {
            dispatch(fetchStories(token));
        })
    }, []);

    return (
        <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4">
            <div className="flex gap-4 pb-5">
                {/* ADD STORY CARD */}
                <div
                    onClick={() => setShowModal(true)}
                    className="rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-3/4 cursor-pointer
                        hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300
                        bg-linear-to-b from-indigo-50 to-white"
                >
                    <div className="h-full flex flex-col items-center justify-center p-4">
                        <div
                            className="size-10 bg-indigo-500 rounded-full flex items-center
                             justify-center mb-3 hover:scale-105 transition-all duration-300"
                        >
                            <Plus className="w-5 h-5 text-white" />
                        </div>

                        <p
                            className="text-sm font-medium text-slate-700 text-center
                             hover:scale-[1.03] transition-all duration-300"
                        >
                            Create Story
                        </p>
                    </div>
                </div>

                {/* STORY CARDS */}
                {stories.map((story) => (
                    <div
                        key={story._id}
                        onClick={() => setViewStory(story)}
                        className="relative rounded-lg shadow min-w-30 max-w-30 max-h-40 cursor-pointer
                            hover:shadow-lg transition-all duration-200 bg-linear-to-b from-indigo-500
                             to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95"
                    >
                        <Image
                            src={story.user.profile_picture || assets.avatar_icon}
                            alt=""
                            width={32}
                            height={32}
                            className="absolute size-8 top-3 left-3 z-10 rounded-full ring
                             ring-gray-100 shadow"
                        />

                        <p className="absolute top-18 left-3 text-white/60 text-sm truncate max-w-24">
                            {story.content}
                        </p>

                        <p className="text-white absolute bottom-1 right-2 z-10 text-xs">
                            {moment(story.createdAt).fromNow()}
                        </p>

                        {story.media_type !== "text" && (
                            <div className="absolute inset-0 z-1 rounded-lg bg-black overflow-hidden">
                                {story.media_type === "image" ? (
                                    <Image
                                        src={story.media_url}
                                        alt=""
                                        fill
                                        className="h-full w-full object-cover hover:scale-110
                                         transition duration-500 opacity-70 hover:opacity-80"
                                    />
                                ) : (
                                    <video
                                        src={story.media_url}
                                        className="h-full w-full object-cover hover:scale-110
                                         transition duration-500 opacity-70 hover:opacity-80"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ADD STORY MODAL */}
            {showModal && <StoryModal setShowModal={setShowModal} />}

            {/* VIEW STORY MODAL */}
            {viewStory && <StoryViewer viewStory={viewStory} setViewStory={setViewStory} />}
        </div>
    )
}

export default StoriesBar
