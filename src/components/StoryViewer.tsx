import Image from "next/image";
import { useEffect, useState } from "react";
import { assets } from "../../public/assets";
import { BadgeCheck, Eye, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useAuth } from "@clerk/nextjs";
import { viewStoryCount } from "@/redux/slices/storySlice";

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
};

type Props = {
  viewStory: StoriesType | null;
  setViewStory: React.Dispatch<React.SetStateAction<StoriesType | null>>
};

const StoryViewer = ({ viewStory, setViewStory }: Props) => {
  const currentUser = useSelector((state: RootState) => state.user.value);
  const { getToken } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let progressInterval: ReturnType<typeof setInterval>;

    if (viewStory && viewStory.media_type !== "video") {
      setProgress(0);

      const duration = 10000;  // 10 sec
      const stepTime = 100;  // 1 sec
      let elapsed = 0;

      progressInterval = setInterval(() => {
        elapsed += stepTime;
        setProgress((elapsed / duration) * 100);
      }, stepTime);

      // Close story after duration (10sec)
      timer = setTimeout(() => {
        setViewStory(null);
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      }
    }
  }, [viewStory, setViewStory]);

  useEffect(() => {
    if (!viewStory || !currentUser) return;

    const viewPayload = async () => {
      const token = await getToken();
      dispatch(viewStoryCount({
        storyId: viewStory._id,
        token,
        userId: currentUser._id
      }));

      setViewStory((prev) => {
        if (!prev) return prev;

        const views = prev.view_count ?? [];
        if (views.includes(currentUser._id)) return prev;
        return {
          ...prev,
          view_count: [...views, currentUser._id]
        };
      });
    }

    viewPayload();

  }, [viewStory?._id]);

  const handleClose = () => {
    setViewStory(null);
  };

  if (!viewStory) return null;

  const renderContent = () => {
    switch (viewStory.media_type) {
      case "image":
        return (
          <Image
            src={viewStory.media_url}
            alt=""
            width={0}
            height={0}
            sizes="100vw"
            style={{
              width: 'auto',
              height: '80vh',
              maxWidth: '100%',
              objectFit: 'contain',
            }}
            className="object-contain"
          />
        );

      case "video":
        return (
          <video
            onEnded={() => setViewStory(null)}
            src={viewStory.media_url}
            className="max-h-screen"
            controls
            autoPlay
          />
        );

      case "text":
        return (
          <div className="w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center">
            {viewStory.content}
          </div>
        )

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-110 h-screen bg-black bg-opacity-90 flex items-center justify-center"
      style={{ backgroundColor: viewStory?.media_type === "text" ? viewStory.background_color : "#000000" }}
    >
      {/* PROGRESS BAR */}
      {viewStory.media_type !== "video" && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
          <div
            className="h-full bg-linear-to-r from-purple-500 via-pink-500
           to-red-500 transition-all duration-100 linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* USER INFO - TOP LEFT */}
      <div
        className="absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8
          backdrop-blur-2xl rounded bg-black/50"
      >
        <Image
          src={viewStory.user.profile_picture || assets.avatar_icon}
          alt=""
          width={28}
          height={28}
          className="size-7 sm:size-8 rounded-full object-cover border border-white"
        />

        <div className="text-white font-medium flex items-center gap-1.5">
          <span>{viewStory.user.full_name}</span>
          <BadgeCheck size={18} />
        </div>

        <p className='text-white font-semibold text-lg'>/</p>

        {/* VIEW COUNT */}
        <div className='text-sm text-white font-medium flex items-center gap-2'>
          <Eye size={18} />
          {viewStory.view_count?.length ?? 0}
        </div>
      </div>

      {/* CLOSE BUTTON */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none"
      >
        <X className="w-8 h-8 hover:scale-110 transition cursor-pointer" />
      </button>

      {/* CONTENT WRAPPER */}
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  )
}

export default StoryViewer
