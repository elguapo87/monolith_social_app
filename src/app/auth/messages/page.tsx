"use client"

import Image from "next/image"
import { assets } from "../../../../public/assets"
import { Eye, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { useEffect } from "react"
import { fetchConnections } from "@/redux/slices/connectionSlice"
import { useAuth } from "@clerk/nextjs"

const Messages = () => {

    const connections = useSelector((state: RootState) => state.connection.connections);
    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();

    const router = useRouter();
    
    useEffect(() => {
        const getConnections = async () => {
            const token = await getToken();
            dispatch(fetchConnections(token));
        }
        getConnections();
    }, []);

    return (
        <div className="min-h-screen relative bg-slate-50">
            <div className="max-w-6xl mx-auto p-6">
                {/* TITLE */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
                    <p className="text-slate-600">Talk to your friends and family</p>
                </div>

                {/* CONNECTED USERS */}
                <div className="flex flex-col gap-3">
                    {connections.map((user) => (
                        <div 
                            key={user._id} 
                            className="max-w-xl flex flex-wrap gap-5 p-6 bg-white shadow rounded-md"
                        >
                            <Image
                                src={user.profile_picture || assets.avatar_icon}
                                width={48}
                                height={48}
                                alt=""
                                className="rounded-full aspect-square size-12 mx-auto"
                            />

                            <div className="flex-1">
                                <p className="font-medium text-slate-700">{user.full_name}</p>
                                <p className="text-slate-500">@{user.user_name}</p>
                                <p className="text-sm text-slate-600">{user.bio}</p>
                            </div>

                            <div className="flex flex-col gap-2 mt-4">
                                <button
                                    onClick={() => router.push(`/auth/chatBox/${user._id}`)}
                                    className="size-10 flex items-center justify-center text-sm rounded
                                     bg-slate-100 hover:bg-slate-200 text-slate-800
                                      active:scale-95 transition cursor-pointer gap-1"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => router.push(`/auth/profile/${user._id}`)}
                                    className="size-10 flex items-center justify-center text-sm rounded
                                     bg-slate-100 hover:bg-slate-200 text-slate-800
                                      active:scale-95 transition cursor-pointer"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Messages