import { getUserPosts } from "@/redux/slices/postSlice";

import { AppDispatch, RootState } from "@/redux/store";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useProfile(profileId: string) {
    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();

    const posts = useSelector((state: RootState) => state.post.posts);
    const postsLoading = useSelector((state: RootState) => state.post.loading);

    useEffect(() => {
        if (!profileId) return;

        getToken().then((token) => {
            dispatch(getUserPosts({ profileId, token }));
        });
    }, [profileId, getToken, dispatch]);

    // derive profile posts
    const profilePosts = useMemo(
        () => posts.filter((post) => post.user._id === profileId),
        [posts, profileId]
    );

    return { posts: profilePosts, loading: postsLoading }
}