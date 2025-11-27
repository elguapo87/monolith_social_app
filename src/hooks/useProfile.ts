import { getUserProfiles } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useProfile(profileId: string) {
    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();
    const { profileData, profilePosts, loading } = useSelector((state: RootState) => state.user);

    const fetchUser = useCallback(async () => {
        if (!profileId) return;

        const token = await getToken();

        await dispatch(getUserProfiles({ profileId, token }));

    }, [profileId, getToken, dispatch]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return { user: profileData, posts: profilePosts, loading, fetchUser }
}