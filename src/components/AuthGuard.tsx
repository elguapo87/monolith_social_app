"use client"

import { useAuth, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Loading from "./Loading";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchUser } from "@/redux/slices/userSlice";
import { addMessage } from "@/redux/slices/messageSlice";


export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isLoaded, user } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const userState = useSelector((state: RootState) => state.user.value);

    const pathname = usePathname();
    const pathnameRef = useRef(pathname);

    useEffect(() => {
        if (isLoaded && !user) {
            router.replace("/");
        }

        if (isLoaded && user && !userState) {
            getToken().then((token: string | null) => {
                if (token) {
                    dispatch(fetchUser(token));
                }
            });
        }

    }, [isLoaded, user, router, dispatch, userState, getToken]);

    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    useEffect(() => {
        if (!userState?._id) return;

        const eventSource = new EventSource(`/api/sse/${userState._id}`);

        eventSource.addEventListener("new-message", (event) => {
            const message = JSON.parse(event.data);

            if (pathnameRef.current === `/auth/chatBox/${message.from_user_id._id}`) {
                dispatch(addMessage(message));
            }
        });


        return () => eventSource.close();

    }, [userState?._id, dispatch]);


    if (!isLoaded) {
        return <Loading />
    }

    if (!user) {
        return null
    }

    return <>{children}</>
}
