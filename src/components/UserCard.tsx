import Image from "next/image";
import { Check, MapPin, MessageCircle, Plus, UserPlus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useAuth } from "@clerk/nextjs";
import { followUser, unfollowUser } from "@/redux/slices/userSlice";
import { acceptConnectionRequest, cancelConnectionRequest, declineConnectionRequest, fetchConnections, sendConnection } from "@/redux/slices/connectionSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

    const handleAccept = async () => {
        const token = await getToken();
        await dispatch(acceptConnectionRequest({ id: user._id, token }));
        dispatch(fetchConnections(token));
    };

    const handleDecline = async () => {
        const token = await getToken();
        await dispatch(declineConnectionRequest({ id: user._id, token }));
        dispatch(fetchConnections(token));
    };

    useEffect(() => {
        const getConnections = async () => {
            const token = await getToken();
            await dispatch(fetchConnections(token));
        }
        getConnections();
    }, []);

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
                    className="rounded-full aspect-square w-16 shadow-md mx-auto"
                />

                <p className="mt-4 font-semibold">{user.full_name}</p>
                {user.user_name && <p className="text-gray-600 font-light">@{user.user_name}</p>}
                {user.bio && <p className="text-gray-600 mt-2 text-center text-sm px-4">{user.bio}</p>}
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
                    className="w-full py-2 rounded-md flex justify-center items-center gap-1 bg-linear-to-r
                        from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                        active:scale-95 transition text-white cursor-pointer"
                >
                    <UserPlus className="w-4 h-4" />
                    {currentUser?.following?.includes(user._id) ? "Following" : "Follow"}
                </button>

                {/* CHAT BUTTON (only when connected) */}
                {isConnected && (
                    <button
                        onClick={() => router.push(`/auth/chatBox/${user._id}`)}
                        className="flex items-center justify-center w-16 border text-slate-500 group rounded-md
                            cursor-pointer active:scale-95 transition"
                    >
                        <MessageCircle className="w-5 h-5 group-hover:scale-105 transition" />
                    </button>
                )}

                {/* SEND CONNECTION BUTTON (not connected, not pending) */}
                {!isConnected && !isPendingSent && !isPendingReceived && (
                    <button
                        onClick={handleConnectionRequest}
                        className="flex items-center justify-center w-16 border text-slate-500 group rounded-md
                            cursor-pointer active:scale-95 transition"
                    >
                        <Plus className="w-5 h-5 group-hover:scale-105 transition" />
                    </button>
                )}

                {/* PENDING SENT BUTTON */}
                {isPendingSent && (
                    <>
                        <div className="flex items-center justify-center w-16 text-xs text-gray-500 border
                            border-gray-300 rounded-md">
                            Pending
                        </div>

                        <div className="relative group flex justify-center items-center">
                            <button
                                onClick={handleCancelRequest}
                                className="p-2 rounded-md flex justify-center items-center border border-gray-300 
                                    bg-white hover:bg-gray-50 active:scale-95 transition duration-200
                                    text-red-500 cursor-pointer"
                            >
                                <X className="w-6 h-6 hover:scale-105 transition duration-200" />
                            </button>

                            {/* Tooltip */}
                            <div
                                className="absolute -top-7 left-1/2 -translate-x-1/2 
                                    px-2 py-1 rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                                    opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                Cancel
                            </div>
                        </div>
                    </>
                )}

                {/* PENDING RECEIVED BUTTONS (Accept / Decline) */}
                {isPendingReceived && (
                    <>
                        <div className="relative group flex justify-center items-center">
                            <button
                                onClick={handleAccept}
                                className="p-2 rounded-md flex justify-center items-center border border-gray-300 
                                    bg-white hover:bg-gray-50 active:scale-95 transition duration-200
                                    text-green-500 cursor-pointer"
                            >
                                <Check className="w-6 h-6 hover:scale-105 transition duration-200" />
                            </button>

                            {/* Tooltip */}
                            <div
                                className="absolute -top-7 left-1/2 -translate-x-1/2 
                                    px-2 py-1 rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                                    opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                Accept Connection Request
                            </div>
                        </div>

                        <div className="relative group flex justify-center items-center">
                            <button
                                onClick={handleDecline}
                                className="p-2 rounded-md flex justify-center items-center border border-gray-300 
                                    bg-white hover:bg-gray-50 active:scale-95 transition duration-200
                                    text-red-500 cursor-pointer"
                            >
                                <X className="w-6 h-6 hover:scale-105 transition duration-200" />
                            </button>

                            {/* Tooltip */}
                            <div
                                className="absolute -top-7 left-1/2 -translate-x-1/2 
                                    px-2 py-1 rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                                    opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                Reject Connection Request
                            </div>
                        </div>

                    </>
                )}
            </div>
        </div>
    )
}

export default UserCard
