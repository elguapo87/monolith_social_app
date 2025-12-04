import Image from "next/image";
import { MapPin, MessageCircle, Plus, UserPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useAuth } from "@clerk/nextjs";
import { followUser, unfollowUser } from "@/redux/slices/userSlice";
import { cancelConnectionRequest, fetchConnections, sendConnection } from "@/redux/slices/connectionSlice";
import { useRouter } from "next/navigation";

type UserProps = {
    user: {
        _id: string;
        email: string;
        full_name: string;
        user_name: string;
        bio: string;
        profile_picture: string;
        cover_photo: string;
        location: string;
        followers: string[];
        following: string[];
        connections: string[];
        posts: never[];
        is_verified: boolean;
        createdAt: string;
        updatedAt: string;
    };
};

const UserCard = ({ user }: UserProps) => {

    const currentUser = useSelector((state: RootState) => state.user.value);
    const { connections, pendingConnections, pendingSent } = useSelector((state: RootState) => state.connection);
    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();

    const router = useRouter();
  
    const toggleFollow = async () => {
        const token = await getToken();
        const isFollowing = currentUser?.following?.includes(user._id);

        if (isFollowing) {
            dispatch(unfollowUser({ targetUserId: user._id, token }));
        } else {
            dispatch(followUser({ targetUserId: user._id, token }));
        }
    };

    const handleConnectionRequest = async () => {
        const token = await getToken();
        await dispatch(sendConnection({ id: user._id, token }));
        dispatch(fetchConnections(token));
    };

    const isPendingSent = pendingSent.some((u) => u.to_user_id._id === user._id);
    const isPendingReceived = pendingConnections.some((u) => u.from_user_id._id === user._id);
    const isConnected = connections.some((u) => u._id === user._id);

    const connectionSent = pendingSent.find((u) => u.to_user_id._id === user._id);
    const connectionId = connectionSent?._id;

    const handleCancelRequest = async () => {
        if (!connectionId) return;

        const token = await getToken();
        
        await dispatch(cancelConnectionRequest({ connectionId, token }));
        dispatch(fetchConnections(token));
    };

    // console.log(pendingSent);

    return (
        <div
            key={user._id}
            className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md"
        >
            <div className="text-center">
                <Image
                    src={user.profile_picture}
                    alt=""
                    width={64}
                    height={64}
                    className="rounded-full w-16 shadow-md mx-auto"
                />

                <p className="mt-4 font-semibold">{user.full_name}</p>
                {user.user_name && <p className="text-gray-600 font-light">@{user.user_name}</p>}
                {user.bio && <p className="text-gray-600 mt-2 text-center text-sm px-4">@{user.bio}</p>}
            </div>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
                <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                    <MapPin className="w-4 h-4" /> {user.location}
                </div>

                <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                    <span>{user.followers.length}</span> Followers
                </div>
            </div>

            <div className="flex mt-4 gap-2">
                {/* FOLLOW BUTTON */}
                <button
                    onClick={toggleFollow}
                    // disabled={currentUser?.followers?.includes(user._id)}
                    className="w-full py-2 rounded-md flex justify-center items-center gap-2 bg-linear-to-r
                        from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                        active:scale-95 transition text-white cursor-pointer"
                >
                    <UserPlus className="w-4 h-4" />
                    {currentUser?.following?.includes(user._id) ? "Following" : "Follow"}
                </button>

                {/* CONNECTION REQUEST BUTTON / MESSAGE BUTTON */}
                <button
                    onClick={(e) => {
                        if (isPendingSent || isPendingReceived || isConnected) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                        }
                        handleConnectionRequest();
                    }}
                    disabled={isPendingSent || isPendingReceived || isConnected}
                    className={`flex items-center justify-center w-16 border text-slate-500 group rounded-md
                        cursor-pointer active:scale-95 transition ${isPendingSent || isPendingReceived ? 
                        "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {isConnected ? (
                        <MessageCircle 
                            onClick={(e) => { e.stopPropagation(); router.push(`/auth/chatBox/${user._id}`); }}
                            className="w-5 h-5 group-hover:scale-105 transition"
                        />
                    ) : isPendingSent ? (
                        <span className="text-xs font-medium text-gray-500">Pending</span>
                    ) : isPendingReceived ? (
                        <span className="text-xs font-medium text-gray-500">Requested</span>
                    ) : (
                        <Plus className="w-5 h-5 group-hover:scale-105 transition" />
                    )}
                </button>

                {isPendingSent && (
                    <button
                    onClick={handleCancelRequest}
                    className="py-2 px-2 rounded-md flex justify-center items-center bg-linear-to-r
                        from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                        active:scale-95 transition text-white cursor-pointer"
                >
                    Cancel
                </button>
                )}
            </div>
        </div>
    )
}

export default UserCard
