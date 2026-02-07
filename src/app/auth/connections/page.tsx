"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react'
import { assets } from '../../../../public/assets';
import { Check, CircleX, MessageSquare, Plus, UserCheck, UserPlus, UserRoundPen, Users, X } from 'lucide-react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { useAuth } from '@clerk/nextjs';
import { acceptConnectionRequest, cancelConnectionRequest, declineConnectionRequest, deleteConnection, fetchConnections, sendConnection } from '@/redux/slices/connectionSlice';
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

    const [followLoading, setFollowLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [declineLoading, setDeclineLoading] = useState(false);
    const [removeLoading, setRemoveLoading] = useState(false);

    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get("tab");

    useEffect(() => {
        if (tabFromUrl) {
            setCurrentTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    useEffect(() => {
        getToken().then((token) => {
            dispatch(fetchConnections(token));
        });
    }, []);

    const handleFollow = async (targetUserId: string) => {
        if (followLoading) return
        setFollowLoading(true);

        try {
            const token = await getToken();
            await dispatch(followUser({ targetUserId, token }));
            dispatch(fetchConnections(token));
        } finally {
            setFollowLoading(false);
        }
    };

    const handleUnfollow = async (targetUserId: string) => {
        if (followLoading) return
        setFollowLoading(true);

        try {
            const token = await getToken();
            await dispatch(unfollowUser({ targetUserId, token }));
            dispatch(fetchConnections(token));
        } finally {
            setFollowLoading(false);
        }
    };

    const handleConnectionRequest = async (id: string) => {
        if (sendLoading) return;
        setSendLoading(true);

        try {
            const token = await getToken();
            await dispatch(sendConnection({ id, token }));
            dispatch(fetchConnections(token));
        } finally {
            setSendLoading(false);
        }
    };

    const handleCancelRequest = async (connectionId: string | null) => {
        if (!connectionId || cancelLoading) return;
        setCancelLoading(true);

        try {
            const token = await getToken();
            await dispatch(cancelConnectionRequest({ connectionId, token }));
            dispatch(fetchConnections(token));
        } finally {
            setCancelLoading(false);
        }
    };

    const handleAccept = async (id: string) => {
        if (acceptLoading) return;
        setAcceptLoading(true);

        try {
            const token = await getToken();
            await dispatch(acceptConnectionRequest({ id, token }));
            dispatch(fetchConnections(token));
        } finally {
            setAcceptLoading(false);
        }
    };

    const handleDecline = async (id: string) => {
        if (declineLoading) return;
        setDeclineLoading(true);

        try {
            const token = await getToken();
            await dispatch(declineConnectionRequest({ id, token }));
            dispatch(fetchConnections(token));
        } finally {
            setDeclineLoading(false);
        }
    };

    const handleDelete = async (connectionId: string | null) => {
        if (!connectionId || removeLoading) return;
        setRemoveLoading(true);

        try {
            const token = await getToken();
            await dispatch(deleteConnection({ connectionId, token }));
            dispatch(fetchConnections(token));
        } finally {
            setRemoveLoading(false);
        }
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
                            className="max-md:hidden flex flex-col items-center justify-center gap-1 border
                             h-20 w-40 border-gray-200 bg-white shadow rounded-md"
                        >
                            <b>{item.value?.length}</b>
                            <p className="text-slate-600">{item.label}</p>
                        </div>
                    ))}

                    {/* MOBILE */}
                    <div className='flex flex-wrap gap-1 md:hidden'>
                        {dataArray.map((tab) => (
                            <div
                                key={tab.label}
                                onClick={() => setCurrentTab(tab.label)}
                                className={`mx-auto flex flex-col items-center justify-center gap-1 border
                                    h-20 w-40 border-gray-200 shadow rounded-md cursor-pointer
                                    ${currentTab === tab.label 
                                        ? "bg-stone-100 border-gray-300 font-medium text-black" 
                                        : "bg-white text-gray-600"}`}
                            >
                                <b>{tab.value?.length}</b>
                                <p>{tab.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TABS */}
                <div
                    className="max-md:hidden inline-flex flex-wrap items-center border border-gray-200
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
                    {dataArray.find((item) => item.label === currentTab)?.value.map((user, index) => {

                        const isConnected = connections.some((c) => c.user?._id === user?.user?._id);
                        const isPendingSent = pendingSent.some((c) => c.user?._id === user?.user?._id);
                        const isPendingReceived = pendingConnections.some((c) => c.user?._id === user?.user?._id);
                        const canSendConnection = !isConnected && !isPendingReceived && !isPendingSent;

                        return (
                            <div
                                key={index}
                                className="md:w-full max-w-88 flex gap-2 md:gap-5 p-6 bg-white shadow rounded-md"
                            >
                                <Image
                                    onClick={() => router.push(`/auth/profile/${user?.user?._id}`)}
                                    src={user?.user?.profile_picture || assets.avatar_icon}
                                    alt=''
                                    width={48}
                                    height={48}
                                    className="rounded-full size-12 shadow-md mx-auto cursor-pointer"
                                />

                                <div className="flex-1">
                                    <div
                                        className='cursor-pointer'
                                        onClick={() => router.push(`/auth/profile/${user?.user?._id}`)}
                                    >
                                        <p className="font-medium text-slate-700">{user?.user?.full_name}</p>
                                        <p className="text-slate-500">@{user?.user?.user_name}</p>
                                        <p
                                            className="text-sm text-slate-600"
                                        >
                                            {user?.user?.bio && user?.user?.bio.slice(0, 30)}...
                                        </p>
                                    </div>

                                    <div className="flex max-sm:flex-col gap-2 mt-4">
                                        {currentTab === "Followers" && (
                                            <div className='flex items-center gap-2'>
                                                {!currentUser?.following?.includes(user?.user?._id) && (
                                                    <button
                                                        onClick={() => handleFollow(user?.user?._id)}
                                                        disabled={followLoading}
                                                        className={`py-2 px-3 rounded flex justify-center items-center
                                                            gap-1 bg-linear-to-r from-indigo-500 to-purple-600
                                                        hover:from-indigo-600 hover:to-purple-700
                                                            active:scale-95 transition text-white cursor-pointer
                                                            ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    >
                                                        { }
                                                        <UserPlus
                                                            className={`w-5 h-5 ${followLoading ? "animate-spin" : ""}`}
                                                        />
                                                        {followLoading ? "Please wait..." : "Follow"}
                                                    </button>
                                                )}

                                                {canSendConnection && (
                                                    <div className='relative group flex justify-center items-center'>
                                                        <button
                                                            onClick={() => handleConnectionRequest(user?.user?._id)}
                                                            disabled={sendLoading}
                                                            className={`p-3 text-sm rounded bg-slate-100
                                                                hover:bg-slate-200 text-slate-500 active:scale-95
                                                                transition cursor-pointer
                                                                ${sendLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                                        >
                                                            {sendLoading ? (
                                                                "..."
                                                            ) : (
                                                                <Plus className="w-5 h-5 group-hover:scale-105 transition" />
                                                            )}
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
                                                    onClick={() => handleUnfollow(user?.user?._id)}
                                                    disabled={followLoading}
                                                    className={`py-2 px-3 rounded flex justify-center items-center
                                                        gap-1 bg-linear-to-r from-indigo-500 to-purple-600
                                                    hover:from-indigo-600 hover:to-purple-700
                                                        active:scale-95 transition text-white cursor-pointer
                                                        ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                                >
                                                    <UserPlus
                                                        className={`w-5 h-5 ${followLoading ? "animate-spin" : ""}`}
                                                    />
                                                    {followLoading ? "Please wait..." : "Unfollow"}
                                                </button>

                                                {canSendConnection && (
                                                    <div className='relative group flex justify-center items-center'>
                                                        <button
                                                            onClick={() => handleConnectionRequest(user?.user?._id)}
                                                            disabled={sendLoading}
                                                            className={`p-3 text-sm rounded bg-slate-100
                                                                hover:bg-slate-200 text-slate-500 active:scale-95
                                                                transition cursor-pointer
                                                                ${sendLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                                        >
                                                            {sendLoading ? (
                                                                "..."
                                                            ) : (
                                                                <Plus className="w-5 h-5 group-hover:scale-105 transition" />
                                                            )}
                                                        </button>

                                                        {/* Tooltip */}
                                                        <div
                                                            className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 
                                                                rounded-md bg-gray-800 text-white text-xs
                                                                whitespace-nowrap opacity-0 group-hover:opacity-100
                                                                transition-opacity"
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
                                                        onClick={() => {
                                                            if (user?.connectionId) {
                                                                handleCancelRequest(user?.connectionId)
                                                            }
                                                        }}
                                                        disabled={cancelLoading}
                                                        className={`py-2.5 px-3 text-sm rounded bg-slate-100
                                                        hover:bg-slate-200 text-red-500 active:scale-95
                                                        transition cursor-pointer
                                                        ${cancelLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    >
                                                        {cancelLoading ? (
                                                            "..."
                                                        ) : (
                                                            <X className="w-5 h-5 hover:scale-105 transition duration-200" />
                                                        )}
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

                                                {!currentUser?.following?.includes(user?.user?._id) && (
                                                    <button
                                                        onClick={() => handleFollow(user?.user?._id)}
                                                        disabled={followLoading}
                                                        className={`py-2 px-3 rounded flex justify-center items-center
                                                            gap-1 bg-linear-to-r from-indigo-500 to-purple-600
                                                        hover:from-indigo-600 hover:to-purple-700
                                                            active:scale-95 transition text-white cursor-pointer
                                                            ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    >
                                                        <UserPlus
                                                            className={`w-5 h-5 ${followLoading ? "animate-spin" : ""}`}
                                                        />
                                                        {followLoading ? "Please wait..." : "Follow"}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {currentTab === "Incoming" && (
                                            <div className='flex items-center gap-2'>
                                                <div className='relative group flex justify-center items-center'>
                                                    <button
                                                        onClick={() => handleAccept(user?.user?._id)}
                                                        disabled={acceptLoading}
                                                        className={`md:w-full p-3 text-sm rounded bg-slate-100
                                                            hover:bg-slate-200 text-green-500 active:scale-95
                                                            transition cursor-pointer
                                                            ${acceptLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    >
                                                        {acceptLoading ? (
                                                            "..."
                                                        ) : (
                                                            <Check
                                                                className="w-5 h-5 hover:scale-105 transition duration-200"
                                                            />
                                                        )}
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
                                                        onClick={() => handleDecline(user?.user?._id)}
                                                        disabled={declineLoading}
                                                        className={`md:w-full p-3 text-sm rounded bg-slate-100
                                                            hover:bg-slate-200 text-red-500 active:scale-95
                                                            transition cursor-pointer
                                                            ${declineLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    >
                                                        {declineLoading ? (
                                                            "..."
                                                        ) : (
                                                            <X className="w-5 h-5 hover:scale-105 transition duration-200" />
                                                        )}
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
                                                        onClick={() => router.push(`/auth/chatBox/${user?.user?._id}`)}
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

                                                {!currentUser?.following?.includes(user?.user?._id) && (
                                                    <button
                                                        onClick={() => handleFollow(user?.user?._id)}
                                                        disabled={followLoading}
                                                        className={`w-full py-2.5 md:px-3 rounded flex justify-center
                                                             items-center gap-1 bg-linear-to-r from-indigo-500
                                                            to-purple-600 hover:from-indigo-600 hover:to-purple-700
                                                            active:scale-95 transition text-white cursor-pointer
                                                            ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    >
                                                        <UserPlus
                                                            className={`w-5 h-5 ${followLoading ? "animate-spin" : ""}`}
                                                        />
                                                        {followLoading ? "Please wait..." : "Follow"}
                                                    </button>
                                                )}

                                                <div className='relative group flex justify-center items-center'>
                                                    <button
                                                        onClick={() => {
                                                            if (user?.connectionId) {
                                                                handleDelete(user?.connectionId)
                                                            }
                                                        }}
                                                        disabled={removeLoading}
                                                        className={`w-full p-3 text-sm rounded bg-slate-100
                                                            hover:bg-slate-200 text-red-500 active:scale-95
                                                            transition cursor-pointer flex items-center
                                                            justify-center gap-1
                                                            ${removeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    >
                                                        {removeLoading ? "..." : <CircleX className="w-5 h-5" />}
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



