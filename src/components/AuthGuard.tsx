"use client"

import { useAuth, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Loading from "./Loading";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchUser } from "@/redux/slices/userSlice";
import { addMessage } from "@/redux/slices/messageSlice";
import { addOrUpdateNotification } from "@/redux/slices/notificationSlice";
import api from "@/lib/axios";
import { addPendingConnection } from "@/redux/slices/connectionSlice";


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

        eventSource.addEventListener("new-message", async (event) => {
            const message = JSON.parse(event.data);

            const isOnChatPage =
                pathnameRef.current === `/auth/chatBox/${message.from_user_id._id}`;

            if (isOnChatPage) {
                dispatch(addMessage(message));

                // NEW CODE – mark as seen in database
                const token = await getToken();
                const { data } = await api.post("/message/markAsSeen", { from_user_id: message.from_user_id._id }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    return data;
                }
            }
        });

        eventSource.addEventListener("new-notification", (event) => {
            const data = JSON.parse(event.data);

            dispatch(addOrUpdateNotification(data));
        });

        eventSource.addEventListener("connection-request", (event) => {
            const payload = JSON.parse(event.data);
            dispatch(addPendingConnection(payload));
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
