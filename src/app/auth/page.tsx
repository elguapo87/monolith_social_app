"use client"

import StoriesBar from "@/components/StoriesBar"
import { useEffect } from "react";
import PostCard from "@/components/PostCard";
import RecentMessages from "@/components/RecentMessages";
import { useAuth } from "@clerk/nextjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getPosts } from "@/redux/slices/postSlice";

const Feed = () => {
  const feeds = useSelector((state: RootState) => state.post.posts);

  const dispatch = useDispatch<AppDispatch>();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchFeeds = async () => {
      const token = await getToken();
      await dispatch(getPosts(token));
    };

    fetchFeeds();
  }, [dispatch, getToken]);

  return (
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
  ) 
}

export default Feed
