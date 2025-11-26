"use client"

import Loading from "@/components/Loading";
import StoriesBar from "@/components/StoriesBar"
import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import RecentMessages from "@/components/RecentMessages";
import { useAuth } from "@clerk/nextjs";
import api from "@/lib/axios";
import toast from "react-hot-toast";

type PostType = {
  _id: string;
    user: {
        _id: string;
        full_name: string;
        email: string;
        profile_picture?: string;
        user_name?: string;
        bio?: string;
        location?: string;
        cover_photo?: string;
        followers?: string[];
        following?: string[];
        connections?: string[];
        createdAt?: Date;
    },
    content: string;
    image_urls: string[];
    post_type: string;
    likes_count: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

const Feed = () => {

  const [feeds, setFeeds] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  const { getToken } = useAuth();

  const fetchFeeds = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await api.get("/post/getPosts", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setFeeds(data.posts);

      } else {
        toast.error(data.message);
      }

    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errMessage);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  return !loading ? (
    <div
      className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8"
    >
      {/* STORIES AND POST LIST */}
      <div>
        <StoriesBar />

        <div className="p-4 space-y-6">
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="max-xl:hidden sticky top-0">
        <RecentMessages />
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default Feed
