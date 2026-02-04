"use client"

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { assets } from "../../../../../public/assets";
import { ImageIcon, SendHorizonal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { addMessage, fetchMessages, resetMessages } from "@/redux/slices/messageSlice";
import { getConnectionUser } from "@/redux/slices/connectionSlice";

const ChatBox = () => {
    const { userId } = useParams() as { userId: string };

    const currentUser = useSelector((state: RootState) => state.user.value);
    const messages = useSelector((state: RootState) => state.message.messages);
    const connectionUser = useSelector((state: RootState) => state.connection.connectionUser);
    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();

    const [text, setText] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const messageEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        getToken().then((token) => {
            dispatch(getConnectionUser({ otherUserId: userId, token }));
            dispatch(resetMessages());
            dispatch(fetchMessages({ to_user_id: userId, token }));
        });
    }, [getToken, dispatch, userId]);

    //  Auto-scroll to most recent message
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!text.trim() && !image) return;

        const token = await getToken();
        try {
            const formData = new FormData();
            formData.append("id", userId);
            formData.append("text", text);
            image && formData.append("image", image);

            dispatch(addMessage({ messageData: formData, token }));
            setText("");
            setImage(null);

        } catch (error) {
            console.error("Failed to add message");
        }
    };

    return connectionUser && (
        <div className="flex flex-col h-screen">
            <div
                className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-linear-to-r from-indigo-50
                    to-purple-50 border-b border-gray-300"
            >
                <Image
                    src={connectionUser.profile_picture || assets.avatar_icon}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8 rounded-full"
                />
                <div>
                    <p className="font-medium">{connectionUser.full_name}</p>
                    <p className="text-sm text-gray-500 -mt-1.5">@{connectionUser.user_name}</p>
                </div>
            </div>

            <div className="p-5 md:px-10 h-full overflow-y-scroll">
                <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.toSorted((a, b) =>
                        new Date(a.createdAt ?? "").getTime() - new Date(b.createdAt ?? "").getTime())
                        .map((message, index) => {
                            const isMine = message.from_user_id.toString() === currentUser?._id.toString();

                            return (
                                <div
                                    key={index}
                                    className={`flex flex-col ${isMine
                                        ? "items-start" : "items-end"}`}
                                >
                                    <div
                                        className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-l shadow                             
                                            ${isMine
                                                ? "rounded-bl-none" 
                                                : "rounded-br-none"}`}
                                    >
                                        {message.message_type === "image" && (
                                            <Image
                                                onClick={() => window.open(message.media_url)}
                                                src={message.media_url ?? ""}
                                                alt=""
                                                width={500}
                                                height={500}
                                                className="w-full max-w-sm rounded-lg mb-1 cursor-pointer"
                                            />
                                        )}
                                        <p>{message.text}</p>
                                    </div>
                                </div>
                            )

                        })}

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