import { getPosts } from "@/redux/slices/postSlice";
import { getUserProfiles } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useProfile(profileId: string) {
    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();

    const profileUser = useSelector((state: RootState) => state.user.profileData);

    const posts = useSelector((state: RootState) => state.post.posts);
    const postsLoading = useSelector((state: RootState) => state.post.loading);

    // fetch profile user
    const fetchUser = useCallback(async () => {
        if (!profileId) return;

        const token = await getToken();

        await dispatch(getUserProfiles({ profileId, token }));

    }, [profileId, getToken, dispatch]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // ensure posts exist
    useEffect(() => {
        if (posts.length > 0) return;

        getToken().then((token) => {
            dispatch(getPosts(token));
        });
    }, [posts.length, getToken, dispatch]);

    // derive profile posts
    const profilePosts = useMemo(
        () => posts.filter((post) => post.user._id === profileId),
        [posts, profileId]
    );

    console.log(profileUser);

    return { user: profileUser, posts: profilePosts, loading: postsLoading, fetchUser }
}