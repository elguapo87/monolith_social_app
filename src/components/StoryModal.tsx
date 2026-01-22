"use client"

import api from "@/lib/axios";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Sparkle, TextIcon, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react"
import toast from "react-hot-toast";

type Props = {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    fetchStories: () => Promise<void>;
};

const StoryModal = ({ setShowModal, fetchStories }: Props) => {

    const bgColors = [
        "#4f46e5",
        "#111111",
        "#7c3aed",
        "#db2777",
        "#e11d48",
        "#ca8a04",
        "#0d9488"
    ]

    const { getToken } = useAuth();

    const [mode, setMode] = useState("text");
    const [background, setBackground] = useState(bgColors[0]);
    const [text, setText] = useState("");
    const [media, setMedia] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const MAX_VIDEO_DURATION = 60;  // seconds
    const MAX_VIDEO_SIZE_MB = 50;  // MB

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith("video")) {
                if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
                    toast.error(`Video file size cannot exeed ${MAX_VIDEO_SIZE_MB}MB.`);
                    setMedia(null);
                    setPreviewUrl(null);
                    return;
                }
                const video = document.createElement("video");
                video.preload = 'metadata';
                video.onloadedmetadata = () => {
                    window.URL.revokeObjectURL(video.src);
                    if (video.duration > MAX_VIDEO_DURATION) {
                        toast.error("Video duration cannot exeed 1 minute.");
                        setMedia(null);
                        setPreviewUrl(null);

                    } else {
                        setMedia(file);
                        setPreviewUrl(URL.createObjectURL(file));
                        setText("");
                        setMode("media");
                    }
                }
                video.src = URL.createObjectURL(file);

            } else {
                setMedia(file);
                setPreviewUrl(URL.createObjectURL(file));
                setText("");
                setMode("media");
            }
        }
    };

    const handleCreateStory = async () => {
        const token = await getToken();

        const media_type = mode === "media" ? media?.type.startsWith("image") ? "image" : "video" : "text";

        if (media_type === "text" && !text.trim()) {
            toast.error("Please enter some text");
            return;
        }

        setLoading(true)

        try {
            const formData = new FormData();
            formData.append("content", text);
            formData.append("background_color", background);

            if (media) {
                formData.append("media", media);
            }

            const { data } = await api.post("/story/addStory", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setShowModal(false);
                toast.success(data.message);
                await fetchStories();

            } else {
                toast.error(data.message)
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-4 flex items-center justify-between">
                    <button onClick={() => setShowModal(false)} className="text-white p-2 cursor-pointer">
                        <ArrowLeft />
                    </button>

                    <h2 className="text-lg font-semibold">Create Story</h2>
                    <span className="w-10"></span>
                </div>

                <div className="rounded-lg h-96 flex items-center justify-center relative" style={{ background: background }}>
                    {
                        mode === "text"
                        &&
                        (
                            <textarea
                                onChange={(e) => setText(e.target.value)}
                                value={text}
                                className="bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none"
                                placeholder="Whats on your mind?"
                            />
                        )
                    }

                    {
                        mode === "media" && previewUrl
                            &&
                            (media?.type.startsWith("image"))
                            ?
                            (<Image src={previewUrl} alt="" fill className="object-contain max-h-full" />)
                            :
                            (previewUrl && <video src={previewUrl} className="object-contain max-h-full" />)
                    }
                </div>

                <div className="flex mt-4 gap-2">
                    {bgColors.map((color) => (
                        <button
                            key={color}
                            className="w-6 h-6 rounded-full ring cursor-pointer"
                            style={{ backgroundColor: color }}
                            onClick={() => setBackground(color)}
                        />
                    ))}
                </div>

                <div className="flex mt-4 gap-2">
                    <button
                        onClick={() => { setMode("text"); setMedia(null); setPreviewUrl(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 p-2 rounded 
                            cursor-pointer ${mode === "text" ? "bg-white text-black" : "bg-zinc-800"}`}
                    >
                        <TextIcon size={18} /> Text
                    </button>

                    <label
                        className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer
                            ${mode === "media" ? "bg-white text-black" : "bg-zinc-800"}`}

                    >
                        <input
                            onChange={(e) => { handleMediaUpload(e); setMode("media"); }}
                            type="file" accept="image/*, video/*"
                            className="hidden"
                        />
                        <Upload size={18} /> Photo/Video
                    </label>
                </div>

                <button
                    onClick={handleCreateStory}
                    disabled={loading}
                    className={`flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded
                        bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 
                        hover:to-purple-700 active:scale-95 transition cursor-pointer
                        ${loading || (!text.trim() && !media) ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                    <Sparkle size={18} /> {loading ? "Saving..." : "Create Story"}
                </button>
            </div>
        </div>
    )
}

export default StoryModal

