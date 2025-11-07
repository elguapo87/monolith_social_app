"use client"

import Loading from "@/components/Loading";
import StoriesBar from "@/components/StoriesBar"
import { useUser } from "@clerk/nextjs";
import { dummyPostsData } from "../../../public/assets";
import { useEffect, useState } from "react";

type FeedType = typeof dummyPostsData;

const Feed = () => {
  const { user, isLoaded } = useUser();

  const [feeds, setFeeds] = useState<FeedType>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeeds = async () => {
    setFeeds(dummyPostsData);
    setLoading(false);
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
          List of posts
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div>
        <h1>Recent Messages</h1>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default Feed
