"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Loading from "./Loading";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchUser } from "@/redux/slices/userSlice";
import { addOrUpdateNotification, markAsSeen } from "@/redux/slices/notificationSlice";
import {
    addAcceptedConnectionNotification,
    addDeclinedConnectionNotification,
    addPendingConnection,
    addRemovedConnectionNotification,
    finalizeAcceptedConnection,
    finalizeRemovedConnection,
    removePendingSentConnection
} from "@/redux/slices/connectionSlice";
import { pusherClient } from "@/lib/pusher/client";
import { addMessagePayload } from "@/redux/slices/messageSlice";

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

type NotificationItem = {
    from_user_id: string;
    last_message_date: Date | string;
    last_message_media: string | null;
    last_message_text: string | "";
    unread_count: number;
    user: {
        full_name: string;
        profile_picture: string;
        _id: string;
    };
};

type RealtimeConnectionRequest = {
    _id: string;
    from_user_id: RealtimeUser;
    to_user_id: { _id: string };
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
};

type ConnectionPayload = {
    connectionId: string;
    user: {
        _id: string;
        full_name: string;
        profile_picture: string;
    };
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

    const [backendReady, setBackendReady] = useState(false);

    // Redirect unauthenticated users
    useEffect(() => {
        if (isLoaded && !user) {
            router.replace("/");
        }
    }, [isLoaded, user, router]);

    // Handshake (Clerk → Backend → Mongo)
    useEffect(() => {
        if (!isLoaded || !user) return;

        const init = async () => {
            let attempts = 0;

            while (attempts < 10) {
                try {
                    const token = await getToken();
                    if (!token) throw new Error("No token");

                    await dispatch(fetchUser(token)).unwrap();
                    setBackendReady(true);
                    return;
                } catch (err) {
                    attempts++;
                    await new Promise(r => setTimeout(r, 300));
                }
            }

            console.error("Backend user provisioning timeout");
        };

        init();
    }, [isLoaded, user, dispatch, getToken]);


    // Track pathname for realtime logic
    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    // Pusher subscriptions (ONLY after backend is ready)
    useEffect(() => {
        if (!backendReady || !userState?._id) return;

        const channelName = `user-${userState._id}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind("new-message", async (message: RealtimeMessage) => {
            const isOnChatPage =
                pathnameRef.current === `/auth/chatBox/${message.from_user_id._id}`;

            if (isOnChatPage) {
                dispatch(addMessagePayload(message));

                const token = await getToken();
                dispatch(markAsSeen({ from_user_id: message.from_user_id._id, token }));
            }
        });

        channel.bind("new-notification", (data: NotificationItem) => {
            const isOnChatPage = pathnameRef.current === `/auth/chatBox/${data.from_user_id}`;

            if (!isOnChatPage) {
                dispatch(addOrUpdateNotification(data));
            }
        });

        channel.bind("connection-request", (payload: RealtimeConnectionRequest) => {
            // const isOnConnectionsPage =
            //     pathnameRef.current.startsWith("/auth/connections");
            // if (!isOnConnectionsPage) {
            // }
            dispatch(addPendingConnection(payload));
        });

        channel.bind("connection-declined", (payload: ConnectionPayload) => {
            dispatch(addDeclinedConnectionNotification(payload));
            dispatch(removePendingSentConnection(payload.connectionId));
        });

        channel.bind("connection-accepted", (payload: ConnectionPayload) => {
            dispatch(addAcceptedConnectionNotification(payload));
            dispatch(finalizeAcceptedConnection(payload));
        });

        channel.bind("connection-removed", (payload: ConnectionPayload) => {
            dispatch(addRemovedConnectionNotification(payload));
            dispatch(finalizeRemovedConnection(payload));
        });

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(channelName);
        };
    }, [backendReady, userState?._id, dispatch, getToken]);

    // Final gate
    if (!isLoaded || !backendReady) {
        return <Loading />;
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
