import { Calendar, MapPin, PenBox, Plus, Verified, X } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { assets } from "../../public/assets";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { followUser, unfollowUser } from "@/redux/slices/userSlice";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { cancelConnectionRequest, fetchConnections, sendConnection } from "@/redux/slices/connectionSlice";

type ProfileProps = {
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
  } | null;

  posts: {
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
  }[];

  setShowEdit: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserProfileInfo = ({ user, posts, setShowEdit }: ProfileProps) => {

  const currentUser = useSelector((state: RootState) => state.user.value);
  const { connections, pendingConnections, pendingSent } = useSelector((state: RootState) => state.connection);
  const dispatch = useDispatch<AppDispatch>();
  const { getToken } = useAuth();

  const [sendLoading, setSendLoading] = useState(false);

  const isCurrentProfile = currentUser?._id === user?._id;
  const isPendingSent = pendingSent.some((u) => u.user._id === user?._id);
  const isPendingReceived = pendingConnections.some((u) => u.user._id === user?._id);
  const isConnected = connections.some((u) => u.user._id === user?._id);

  const connectionSent = pendingSent.find((u) => u.user._id === user?._id);
  const connectionId = connectionSent?.connectionId;

  const toggleFollow = async () => {
    const isFollowing = currentUser?.following?.includes(user?._id ?? "");
    const token = await getToken();
    if (!user?._id) return;

    if (isFollowing) {
      dispatch(unfollowUser({ targetUserId: user?._id, token }));

    } else {
      dispatch(followUser({ targetUserId: user._id, token }));
    }
  }

  const handleSendRequest = async () => {
    if (!user?._id || sendLoading) return;
    setSendLoading(true);

    try {
      const token = await getToken();
      await dispatch(sendConnection({ id: user?._id, token })).unwrap();
      await dispatch(fetchConnections(token));

    } finally {
      setSendLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!connectionId || sendLoading) return;
    setSendLoading(true);

    try {
      const token = await getToken();
      await dispatch(cancelConnectionRequest({ connectionId, token }));
      await dispatch(fetchConnections(token));
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div className="relative py-4 px-6 md:px-8 bg-white">
      <div className="flex flex-col md:flex-row items-start gap-6">

        <div className="w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full">
          {user?.profile_picture && (
            <Image
              src={user.profile_picture || assets.avatar_icon}
              alt=""
              fill
              className="absolute aspect-square rounded-full z-2"
            />
          )}
        </div>

        <div className="w-full pt-16 md:pt-0 md:pl-36">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
                <Verified className="w-6 h-6 text-blue-500" />
              </div>

              <p className="text-gray-600">{user?.user_name ? `@${user.user_name}` : "Add a username"}</p>
            </div>

            {/* If user is not on others profile that means he is opening his profile so we will give edit button */}
            {isCurrentProfile && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2
                      rounded-lg font-medium transition-colors mt-4 md:mt-0 cursor-pointer"
              >
                <PenBox className="w-4 h-4" />
                Edit
              </button>
            )}

            <div className="flex items-center gap-2 mt-3 md:mt-0">
              <div className="relative group flex items-center justify-center">
                {(!isCurrentProfile) && (!isConnected && !isPendingReceived && !isPendingSent) && (
                  <>
                    <button
                      onClick={handleSendRequest}
                      disabled={sendLoading}
                      className={`flex items-center px-4 py-2 border text-slate-500 group rounded-md
                          cursor-pointer active:scale-95 transition 
                          ${sendLoading ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      {sendLoading ? "..." : <Plus className="w-5 h-5 group-hover:scale-105 transition" />}
                    </button>

                    {/* Tooltip */}
                    <div
                      className="absolute -top-7 left-1/2 -translate-x-1/2 
                          px-2 py-1 rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                          opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Send connection request
                    </div>
                  </>
                )}
              </div>

              {!isCurrentProfile && (!isConnected && isPendingSent && !isPendingReceived) && (
                <div className="relative group flex items-center justify-center">
                  <button
                    onClick={handleCancelRequest}
                    className={`p-2 rounded-md flex justify-center items-center border border-gray-300 
                      bg-white transition duration-200
                      text-red-500 cursor-pointer hover:bg-gray-50 active:scale-95
                      ${sendLoading ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    {sendLoading ? "..." : <X className="w-6 h-6 hover:scale-105 transition duration-200" />}
                  </button>

                  {/* Tooltip */}
                  <div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 
                      px-2 py-1 rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                      opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Cancel connection request
                  </div>
                </div>
              )}


              {!isCurrentProfile && (
                <button
                  onClick={toggleFollow}
                  className={`px-4 py-2 rounded-md flex justify-center items-center bg-linear-to-r
                          from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                          active:scale-95 transition text-white cursor-pointer `}
                >
                  {!currentUser?.following?.includes(user?._id ?? "") ? (
                    "Follow"
                  ) : (
                    "Unfollow"
                  )}
                </button>
              )}

            </div>
          </div>

          <p className="text-gray-700 text-sm max-w-md mt-4">{user?.bio}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {user?.location ? user.location : "Add location"}
            </span>

            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Joined <span className="font-medium">{moment(user?.createdAt).fromNow()}</span>
            </span>
          </div>

          <div className="flex items-center gap-6 mt-6 border-t border-gray-200 pt-4">
            <div>
              <span className="sm:text-xl font-bold text-gray-900">{posts.length}</span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1.5">Posts</span>
            </div>
            <div>
              <span className="sm:text-xl font-bold text-gray-900">{user?.followers?.length}</span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1.5">Followers</span>
            </div>
            <div>
              <span className="sm:text-xl font-bold text-gray-900">{user?.following?.length}</span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1.5">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfileInfo


