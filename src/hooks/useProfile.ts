import api from "@/lib/axios";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

type UserData = {
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
}
type PostsData = {
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
}; 

export function useProfile(profileId: string) {
    const { getToken } = useAuth();

    const [user, setUser] = useState<UserData | null>(null);
    const [posts, setPosts] = useState<PostsData[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUser = useCallback(async () => {
        if (!profileId) return;

        setLoading(true);
        const token = await getToken();

        try {
            const { data } = await api.post("/user/getUserProfiles", { profileId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setUser(data.profile);
                setPosts(data.post);

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage); 
        }

        setLoading(false);
    }, [profileId, getToken]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return { user, posts, loading, fetchUser }
}