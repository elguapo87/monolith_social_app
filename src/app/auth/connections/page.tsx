"use client"

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { assets } from '../../../../public/assets';
import { Check, CircleX, Eye, MessageSquare, Plus, UserCheck, UserPlus, UserRoundPen, Users, X } from 'lucide-react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { useAuth } from '@clerk/nextjs';
import { acceptConnectionRequest, cancelConnectionRequest, declineConnectionRequest, deleteConnection, fetchConnections, IUser, PendingData, sendConnection } from '@/redux/slices/connectionSlice';
import Loading from '@/components/Loading';
import { followUser, unfollowUser } from '@/redux/slices/userSlice';

const Connections = () => {
    const {
        connections,
        followers,
        following,
        pendingConnections,
        pendingSent,
        loading,
    } = useSelector((state: RootState) => state.connection);

    const currentUser = useSelector((state: RootState) => state.user.value);

    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();

    const [currentTab, setCurrentTab] = useState("Followers");
    const router = useRouter();

    const dataArray = [
        { label: "Followers", value: followers, icon: Users },
        { label: "Following", value: following, icon: UserCheck },
        { label: "Pending", value: pendingSent, icon: UserRoundPen },
        { label: "Incoming", value: pendingConnections, icon: UserRoundPen },
        { label: "Connections", value: connections, icon: UserPlus },
    ];

    useEffect(() => {
        getToken().then((token) => {
            dispatch(fetchConnections(token));
        });
    }, []);

    const toFullUser = (u: IUser | { _id: string }): IUser => {
        if ("full_name" in u && "email" in u) {
            return u; // Already a full IUser
        }

        // Convert minimal object → safe IUser shape
        return {
            _id: u._id,
            full_name: "Unknown User",
            email: "unknown@example.com",
            user_name: "unknown",
            bio: "",
            profile_picture: "",
            followers: [],
            following: [],
            connections: []
        };
    };

    const normalizeUser = (item: IUser | PendingData, tab: string) => {
        if (tab === "Pending") {
            return {
                user: toFullUser((item as PendingData).to_user_id),
                connectionId: (item as PendingData)._id,
                otherUserId: (item as PendingData).to_user_id._id
            };
        }

        if (tab === "Incoming") {
            return {
                user: toFullUser((item as PendingData).from_user_id),
                connectionId: (item as PendingData)._id,
                otherUserId: (item as PendingData).from_user_id._id
            };
        }

        if (tab === "Connections") {
            return {
                user: toFullUser(item as IUser),
                connectionId: (item as IUser).connectionId || null,   // FIX
                otherUserId: (item as IUser)._id
            };
        }

        // Followers, following, connections
        return {
            user: toFullUser(item as IUser),
            connectionId: null,
            otherUserId: (item as IUser)._id
        }
    }

    const handleFollow = async (targetUserId: string) => {
        const token = await getToken();
        await dispatch(followUser({ targetUserId, token }));
        dispatch(fetchConnections(token));
    };

    const handleUnfollow = async (targetUserId: string) => {
        const token = await getToken();
        await dispatch(unfollowUser({ targetUserId, token }));
        dispatch(fetchConnections(token));
    };

    const handleConnectionRequest = async (id: string) => {
        const token = await getToken();
        await dispatch(sendConnection({ id, token }));
        dispatch(fetchConnections(token));
    };

    const handleCancelRequest = async (connectionId: string | null) => {
        if (!connectionId) return;
        const token = await getToken();
        await dispatch(cancelConnectionRequest({ connectionId, token }));
        dispatch(fetchConnections(token));
    };

    const handleAccept = async (id: string) => {
        const token = await getToken();
        await dispatch(acceptConnectionRequest({ id, token }));
        dispatch(fetchConnections(token));
    };

    const handleDecline = async (id: string) => {
        const token = await getToken();
        await dispatch(declineConnectionRequest({ id, token }));
        dispatch(fetchConnections(token));
    };

    const handleDelete = async (connectionId: string | null) => {
        if (!connectionId) return;
        const token = await getToken();
        await dispatch(deleteConnection({ connectionId, token }));
        dispatch(fetchConnections(token));
    }

    if (loading) return <Loading />

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto p-6">
                {/* TITLE */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Connections</h1>
                    <p className="text-slate-600">Manage your network and discover new connections</p>
                </div>

                {/* COUNTS */}
                <div className="mb-8 flex flex-wrap gap-6">
                    {dataArray.map((item, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-center gap-1 border
                             h-20 w-40 border-gray-200 bg-white shadow rounded-md"
                        >
                            <b>{item.value?.length}</b>
                            <p className="text-slate-600">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* TABS */}
                <div
                    className="inline-flex flex-wrap items-center border border-gray-200
                     rounded-md p-1 bg-white shadow-sm"
                >
                    {dataArray.map((tab) => (
                        <button
                            key={tab.label}
                            onClick={() => setCurrentTab(tab.label)}
                            className={`flex items-center px-3 py-1 text-sm rounded-md transition-colors
                                cursor-pointer ${currentTab === tab.label ?
                                    "bg-white font-medium text-black" :
                                    "text-gray-500 hover:text-black"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="ml-1">{tab.label}</span>

                            {tab.value?.length !== undefined && (
                                <span
                                    className="ml-2 text-xs bg-gray-100 text-gray-700 px-2
                                        py-0.5 rounded-full"
                                >
                                    {tab.value.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* CONNECTIONS */}
                <div className="flex flex-wrap gap-6 mt-6">
                    {dataArray.find((item) => item.label === currentTab)?.value.map((row) => {
                        const { user, connectionId: normalizedId } = normalizeUser(row, currentTab);

                        let connectionId = normalizedId;
                        if (currentTab === "Pending") {
                            const sent = pendingSent.find((u) => u.to_user_id._id === user._id);
                            if (sent?._id) connectionId = sent._id;
                        }

                        const isConnected = connections.some((u) => u._id === user._id);
                        const isPendingSent = pendingSent.some((u) => u.to_user_id._id === user._id);
                        const isPendingReceived = pendingConnections.some((u) => u.from_user_id._id === user._id);
                        const canSendConnection = !isConnected && !isPendingReceived && !isPendingSent;

                        return (
                            <div
                                key={user?._id}
                                className="md:w-full max-w-88 flex gap-2 md:gap-5 p-6 bg-white shadow rounded-md"
                            >
                                <Image
                                    onClick={() => router.push(`/auth/profile/${user?._id}`)}
                                    src={user?.profile_picture || assets.avatar_icon}
                                    alt=''
                                    width={48}
                                    height={48}
                                    className="rounded-full size-12 shadow-md mx-auto cursor-pointer"
                                />

                                <div className="flex-1">
                                    <div  
                                        className='cursor-pointer'
                                        onClick={() => router.push(`/auth/profile/${user?._id}`)}
                                    >
                                        <p className="font-medium text-slate-700">{user?.full_name}</p>
                                        <p className="text-slate-500">@{user?.user_name}</p>
                                        <p className="text-sm text-slate-600">{user?.bio && user.bio.slice(0, 30)}...</p>
                                    </div>

                                    <div className="flex max-sm:flex-col gap-2 mt-4">
                                        {currentTab === "Followers" && (
                                            <div className='flex items-center gap-2'>
                                                {!currentUser?.following?.includes(user._id) && (
                                                    <button
                                                        onClick={() => handleFollow(user._id)}
                                                        className="py-2 px-3 rounded flex justify-center items-center
                                                            gap-1 bg-linear-to-r from-indigo-500 to-purple-600
                                                        hover:from-indigo-600 hover:to-purple-700
                                                            active:scale-95 transition text-white cursor-pointer"
                                                    >
                                                        <UserPlus className="w-5 h-5" />
                                                        Follow
                                                    </button>
                                                )}

                                                {canSendConnection && (
                                                    <div className='relative group flex justify-center items-center'>
                                                        <button
                                                            onClick={() => handleConnectionRequest(user._id)}
                                                            className="p-3 text-sm rounded bg-slate-100
                                                                hover:bg-slate-200 text-slate-500 active:scale-95
                                                                transition cursor-pointer"
                                                        >
                                                            <Plus className="w-5 h-5 hover:scale-105 transition duration-200" />
                                                        </button>

                                                        {/* Tooltip */}
                                                        <div
                                                            className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 
                                                                rounded-md bg-gray-800 text-white text-xs
                                                                whitespace-nowrap opacity-0
                                                                group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Send Connection Request
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        )}

                                        {currentTab === "Following" && (
                                            <div className='flex items-center gap-2'>
                                                <button
                                                    onClick={() => handleUnfollow(user._id)}
                                                    className="py-2 px-3 rounded flex justify-center items-center
                                                        gap-1 bg-linear-to-r from-indigo-500 to-purple-600
                                                    hover:from-indigo-600 hover:to-purple-700
                                                        active:scale-95 transition text-white cursor-pointer"
                                                >
                                                    <UserPlus className="w-5 h-5" />
                                                    Unfollow
                                                </button>

                                                {canSendConnection && (
                                                    <div className='relative group flex justify-center items-center'>
                                                        <button
                                                            onClick={() => handleConnectionRequest(user._id)}
                                                            className="p-3 text-sm rounded bg-slate-100
                                                        hover:bg-slate-200 text-slate-500 active:scale-95
                                                        transition cursor-pointer"
                                                        >
                                                            <Plus className="w-5 h-5 hover:scale-105 transition duration-200" />
                                                        </button>

                                                        {/* Tooltip */}
                                                        <div
                                                            className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 
                                                                rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                                                                opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Send Connection Request
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                        )}

                                        {currentTab === "Pending" && (
                                            <div className='flex items-center gap-2'>
                                                <div className='relative group flex justify-center items-center'>
                                                    <button
                                                        onClick={() => handleCancelRequest(connectionId)}
                                                        className="py-2.5 px-3 text-sm rounded bg-slate-100
                                                        hover:bg-slate-200 text-red-500 active:scale-95
                                                        transition cursor-pointer"
                                                    >
                                                        <X className="w-5 h-5 hover:scale-105 transition duration-200" />
                                                    </button>

                                                    {/* Tooltip */}
                                                    <div
                                                        className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 
                                                                rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                                                                opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Cancel connection request
                                                    </div>
                                                </div>

                                                {!currentUser?.following?.includes(user._id) && (
                                                    <button
                                                        onClick={() => handleFollow(user._id)}
                                                        className="py-2 px-3 rounded flex justify-center items-center
                                                            gap-1 bg-linear-to-r from-indigo-500 to-purple-600
                                                        hover:from-indigo-600 hover:to-purple-700
                                                            active:scale-95 transition text-white cursor-pointer"
                                                    >
                                                        <UserPlus className="w-5 h-5" />
                                                        Follow
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {currentTab === "Incoming" && (
                                            <div className='flex items-center gap-2'>
                                                <div className='relative group flex justify-center items-center'>
                                                    <button
                                                        onClick={() => handleAccept(user._id)}
                                                        className="md:w-full p-3 text-sm rounded bg-slate-100
                                                            hover:bg-slate-200 text-green-500 active:scale-95
                                                            transition cursor-pointer"
                                                    >
                                                        <Check className="w-5 h-5 hover:scale-105 transition duration-200" />
                                                    </button>

                                                    {/* Tooltip */}
                                                    <div
                                                        className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 
                                                            rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                                                            opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Accept Connection Request
                                                    </div>
                                                </div>

                                                <div className='relative group flex justify-center items-center'>
                                                    <button
                                                        onClick={() => handleDecline(user._id)}
                                                        className="md:w-full p-3 text-sm rounded bg-slate-100
                                                            hover:bg-slate-200 text-red-500 active:scale-95
                                                            transition cursor-pointer"
                                                    >
                                                        <X className="w-5 h-5 hover:scale-105 transition duration-200" />
                                                    </button>

                                                    {/* Tooltip */}
                                                    <div
                                                        className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 
                                                            rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                                                            opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Reject Connection Request
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {currentTab === "Connections" && (
                                            <div className='flex items-center gap-2'>
                                                <div className='relative group flex justify-center items-center'>
                                                    <button
                                                        onClick={() => router.push(`/auth/chatBox/${user?._id}`)}
                                                        className="p-3 text-sm rounded bg-slate-100
                                                            hover:bg-slate-200 text-black active:scale-95
                                                            transition cursor-pointer flex items-center justify-center gap-1"
                                                    >
                                                        <MessageSquare className="w-5 h-5" />
                                                    </button>

                                                    {/* Tooltip */}
                                                    <div
                                                        className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 
                                                            rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                                                            opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Send a message to this user
                                                    </div>
                                                </div>

                                                {!currentUser?.following?.includes(user._id) && (
                                                    <button
                                                        onClick={() => handleFollow(user._id)}
                                                        className="w-full py-2.5 md:px-3 rounded flex justify-center items-center
                                                            gap-1 bg-linear-to-r from-indigo-500 to-purple-600
                                                        hover:from-indigo-600 hover:to-purple-700
                                                            active:scale-95 transition text-white cursor-pointer"
                                                    >
                                                        <UserPlus className="w-5 h-5" />
                                                        Follow
                                                    </button>
                                                )}

                                                <div className='relative group flex justify-center items-center'>
                                                    <button
                                                        onClick={() => handleDelete(connectionId)}
                                                        className="w-full p-3 text-sm rounded bg-slate-100
                                                            hover:bg-slate-200 text-red-500 active:scale-95
                                                            transition cursor-pointer flex items-center justify-center gap-1"
                                                    >
                                                        <CircleX className="w-5 h-5" />
                                                    </button>

                                                    {/* Tooltip */}
                                                    <div
                                                        className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 
                                                            rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                                                            opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Remove connection
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default Connections



