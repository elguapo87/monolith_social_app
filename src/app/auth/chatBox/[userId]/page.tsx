"use client"

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { assets } from "../../../../../public/assets";
import { ImageIcon, SendHorizonal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import api from "@/lib/axios";
import { IUser } from "@/redux/slices/connectionSlice";
import toast from "react-hot-toast";
import { addMessage, fetchMessages, resetMessages } from "@/redux/slices/messageSlice";

const ChatBox = () => {
    const { userId } = useParams() as { userId: string };

    const messages = useSelector((state: RootState) => state.message.messages);
    const { getToken } = useAuth();
    const dispatch = useDispatch<AppDispatch>();

    const [text, setText] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [user, setUser] = useState<IUser | null>(null);

    const messageEndRef = useRef<HTMLDivElement | null>(null);


    const fetchConnection = async () => {
            try {
                const token = await getToken();
                const { data } = await api.post("/connection/getConnection", { otherUserId: userId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    setUser(data.user);

                } else {
                    toast.error(data.message);
                }

            } catch (error) {
                const err = error instanceof Error ? error.message : "Unknown error";
                console.error(err);
            }
        }

        const fetchUserMessages = async () => {
            try {
                const token = await getToken();
                dispatch(fetchMessages({ to_user_id: userId, token }));
    
            } catch (error) {
                const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
                toast.error(errMesage)
            }
        };

    useEffect(() => {
        const init = async () => {
            try {
                fetchConnection();
                dispatch(resetMessages());
                fetchUserMessages();
                

            } catch (error) {
                console.error(error);
            }
        }

        init();
    }, [userId]);

    //  Auto-scroll to most recent message
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        try {
            const token = await getToken();

            if (!text.trim() && !image) return;

            const formData = new FormData();
            formData.append("id", userId);
            formData.append("text", text);
            image && formData.append("image", image);

            const { data } = await api.post("/message/addMessage", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setText("");
                setImage(null);
                dispatch(addMessage(data.message));

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            const errMesage = error instanceof Error ? error.message : "An unknown error occurred";
            console.error(errMesage);
        }
    };

    return user && (
        <div className="flex flex-col h-screen">
            <div
                className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-linear-to-r from-indigo-50
                    to-purple-50 border-b border-gray-300"
            >
                <Image
                    src={user.profile_picture || assets.avatar_icon}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8 rounded-full"
                />
                <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-gray-500 -mt-1.5">@{user.user_name}</p>
                </div>
            </div>

            <div className="p-5 md:px-10 h-full overflow-y-scroll">
                <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.toSorted((a, b) =>
                        new Date(a.createdAt ?? "").getTime() - new Date(b.createdAt ?? "").getTime())
                        .map((message, index) => (
                            <div
                                key={index}
                                className={`flex flex-col ${message.to_user_id !== user._id
                                    ? "items-start" : "items-end"}`}
                            >
                                <div
                                    className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg
                                        shadow ${message.to_user_id !== user._id
                                            ? "rounded-bl-none" : "rounded-br-none"}`}
                                >
                                    {message.message_type === "image" && (
                                        <Image
                                            src={message.media_url ?? ""}
                                            alt=""
                                            width={500}
                                            height={500}
                                            className="w-full max-w-sm rounded-lg mb-1"
                                        />
                                    )}
                                    <p>{message.text}</p>
                                </div>
                            </div>
                        ))}

                    <div ref={messageEndRef} />
                </div>
            </div>

            <div className="px-4">
                <div
                    className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border 
                        border-gray-200 shadow rounded-full mb-5"
                >
                    <input
                        onChange={(e) => setText(e.target.value)}
                        value={text}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        type="text"
                        className="flex-1 outline-none text-slate-700"
                        placeholder="Type a message..."
                    />

                    <label htmlFor="image">
                        {image ? (
                            <Image
                                src={URL.createObjectURL(image)}
                                width={32}
                                height={32}
                                alt=""
                                className="h-8 rounded"
                            />
                        ) : (
                            <ImageIcon className="size-7 text-gray-400 cursor-pointer" />
                        )}

                        <input
                            onChange={(e) => e.target.files && setImage(e.target.files[0])}
                            type="file"
                            id="image"
                            accept="image/*"
                            hidden
                        />
                    </label>

                    <button
                        onClick={sendMessage}
                        className="bg-linear-to-br from-indigo-500 to-purple-600 hover:from-indigo-700
                            hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full"
                    >
                        <SendHorizonal size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatBox