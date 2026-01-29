import { getUserPosts } from "@/redux/slices/postSlice";
import { getUserById } from "@/redux/slices/profileSlice";

import { AppDispatch, RootState } from "@/redux/store";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useProfile(profileId: string) {
    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();

    const profile = useSelector((state: RootState) => state.profile.profile);
    const posts = useSelector((state: RootState) => state.post.posts);
    const loading = useSelector((state: RootState) => state.profile.loading || state.post.loading);

    useEffect(() => {
        if (!profileId) return;

        getToken().then((token) => {
            dispatch(getUserPosts({ profileId, token }));
            dispatch(getUserById({ profileId, token }));
        });
    }, [profileId, getToken, dispatch]);

    // derive profile posts
    const profilePosts = useMemo(
        () => posts.filter((post) => post.user._id === profileId),
        [posts, profileId]
    );

    return { user: profile, posts: profilePosts, loading }
}