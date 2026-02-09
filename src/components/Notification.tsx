import { useAuth } from '@clerk/nextjs';
import { Bell } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react'
import { assets } from '../../public/assets';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentConversations } from '@/redux/slices/notificationSlice';
import { AppDispatch, RootState } from '@/redux/store';
import moment from 'moment';
import { fetchConnections } from '@/redux/slices/connectionSlice';

type SidebarProps = {
    sidebarOpen?: boolean;
    setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Notification = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();
    const { unread: unreadMessages } = useSelector((state: RootState) => state.notifications);
    const pendingConnections = useSelector((state: RootState) => state.connection.pendingConnections);

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    const totalUnread = unreadMessages.reduce((sum, msg) => sum + msg.unread_count, 0);

    const totalNotifications = totalUnread + pendingConnections.length;

    const messageNotifications = unreadMessages.map((msg) => ({
        type: "message" as const,
        id: msg.from_user_id,
        payload: msg
    }));

    const connectionNotification = pendingConnections.map((conn) => ({
        type: "connection" as const,
        id: conn.connectionId,
        payload: conn
    }));

    const notifications = [...messageNotifications, ...connectionNotification];

    useEffect(() => {
        getToken().then((token) => {
            dispatch(fetchRecentConversations(token));
            dispatch(fetchConnections(token));
        });

    }, [getToken, dispatch]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showMenu]);

    const handleOpenChat = (userId: string) => {
        router.push(`/auth/chatBox/${userId}`);
        setShowMenu(false);
        if (setSidebarOpen) {
            setSidebarOpen(false);
        }
    };

    const handleOpenConnections = () => {
        router.push("/auth/connections?tab=Incoming");
        setShowMenu(false);
        if (setSidebarOpen) {
            setSidebarOpen(false);
        }
    }

    return (
        <div className='relative cursor-pointer' ref={menuRef}>
            <div onClick={() => setShowMenu(prev => !prev)}>
                <Bell size={28} />

                {totalNotifications > 0 && (
                    <div
                        className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-red-500
                         text-white flex items-center justify-center p-2.5"
                    >
                        <p className="text-sm font-semibold">{totalNotifications}</p>
                    </div>
                )}
            </div>

            {showMenu && (
                <div
                    className={`absolute top-full max-md:-right-20 md:right-0 mt-2 w-72 bg-white
                        rounded-xl shadow-lg border border-gray-200 p-3 z-50
                        ${!sidebarOpen ? "max-md:-translate-x-1/8" : ""}`}
                >
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                        Notifications
                    </p>

                    {notifications.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-2">
                            All caught up
                        </p>
                    )}

                    <div className="flex flex-col md:gap-2">
                        {notifications.map((notification) => {
                            if (notification.type === "message") {
                                const msg = notification.payload;

                                return (
                                    <div
                                        key={`msg-${notification.id}`}
                                        onClick={() => handleOpenChat(msg.user._id)}
                                        className="flex items-center gap-3 p-2 rounded-lg
                                            hover:bg-gray-100 transition cursor-pointer"
                                    >
                                        <Image
                                            src={msg.user.profile_picture || assets.avatar_icon}
                                            alt={msg.user.full_name}
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover size-10"
                                        />

                                        <div className="flex-1 flex flex-col">
                                            <p className="font-medium text-sm text-gray-800">
                                                {msg.user.full_name}
                                            </p>
                                            <p className="text-xs px-1 bg-red-500 rounded w-fit text-white">
                                                {msg.unread_count} unread message
                                                {msg.unread_count > 1 && "s"}
                                            </p>
                                            <span className='text-xs text-gray-400'>
                                                {moment(msg.last_message_date).fromNow()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }

                            if (notification.type === "connection") {
                                const conn = notification.payload;

                                return (
                                    <div
                                        key={`conn-${notification.id}`}
                                        onClick={handleOpenConnections}
                                        className="flex items-center gap-3 p-2 rounded-lg
                                            hover:bg-gray-100 transition cursor-pointer"
                                    >
                                        <Image
                                            src={conn.user.profile_picture || assets.avatar_icon}
                                            alt={conn.user.full_name}
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover size-10"
                                        />

                                        <div className="flex-1 flex flex-col">
                                            <p className="text-xs text-gray-500">
                                                Connection request
                                            </p>
                                            <p className="font-medium text-sm text-gray-800">
                                                {conn.user.full_name}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Notification
