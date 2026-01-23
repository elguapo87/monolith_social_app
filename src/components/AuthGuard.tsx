"use client"

import { useAuth, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Loading from "./Loading";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchUser } from "@/redux/slices/userSlice";
import { addMessage } from "@/redux/slices/messageSlice";
import { addOrUpdateNotification, NotificationItem } from "@/redux/slices/notificationSlice";
import api from "@/lib/axios";
import { addPendingConnection } from "@/redux/slices/connectionSlice";
import { pusherClient } from "@/lib/pusher/client";

type RealtimeUser = {
    _id: string;
    full_name: string;
    profile_picture?: string;
};

type RealtimeMessage = {
    _id: string;
    from_user_id: RealtimeUser;
    to_user_id: string;
    text: string;
    media_url?: string | null;
    message_type: "text" | "image";
    createdAt: string;
};

type RealtimeConnectionRequest = {
    _id: string;
    from_user_id: RealtimeUser;
    to_user_id: { _id: string };
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
};

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

        if (isLoaded && user && !userState?._id) {
            getToken().then((token) => {
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

        const channelName = `user-${userState._id}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind("new-message", async (message: RealtimeMessage) => {
            const isOnChatPage = pathnameRef.current === `/auth/chatBox/${message.from_user_id._id}`;

            if (isOnChatPage) {
                dispatch(addMessage(message));

                const token = await getToken();
                await api.post("/message/markAsSeen", { from_user_id: message.from_user_id._id }, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }
        });

        channel.bind("new-notification", (data: NotificationItem) => {
            dispatch(addOrUpdateNotification(data));
        });

        channel.bind("connection-request", (payload: RealtimeConnectionRequest) => {
            const isOnConnectionsPage = pathnameRef.current.startsWith("/auth/connections");
            if (!isOnConnectionsPage) {
                dispatch(addPendingConnection(payload));
            }
        });

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(channelName);
        };

    }, [userState?._id, dispatch, getToken]);


    if (!isLoaded) {
        return <Loading />
    }

    if (!user) {
        return null
    }

    return <>{children}</>
}
