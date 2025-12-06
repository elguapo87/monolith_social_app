"use client"

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "./Loading";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchUser } from "@/redux/slices/userSlice";
import { fetchConnections } from "@/redux/slices/connectionSlice";


export default function AuthGuard({ children } : { children: React.ReactNode }) {
    const { isLoaded, user } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const userState = useSelector((state: RootState) => state.user.value)

    useEffect(() => {
        if (isLoaded && !user) {
            router.replace("/");
        }

        if (isLoaded && user && !userState) {
            getToken().then((token: string | null) => {
                if (token) {
                    dispatch(fetchUser(token));
                    // dispatch(fetchConnections(token));
                } 
            });
        }

    }, [isLoaded, user, router, dispatch, userState, getToken]);      

    if (!isLoaded) {
        return <Loading />
    }

    if (!user) {
        return null
    }

    return <>{children}</>
}
