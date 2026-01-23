import api from '@/lib/axios';
import { useAuth } from '@clerk/nextjs';
import { Bell } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { assets } from '../../public/assets';
import { useDispatch, useSelector } from 'react-redux';
import { setNotifications } from '@/redux/slices/notificationSlice';
import { AppDispatch, RootState } from '@/redux/store';
import moment from 'moment';

type SidebarProps = {
    sidebarOpen?: boolean;
    setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Notification = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {

    const { getToken } = useAuth();

    const unreadMessages = useSelector((state: RootState) => state.notifications.items || []);
    const userId = useSelector((state: RootState) => state.user.value?._id);
    const dispatch = useDispatch<AppDispatch>();

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    const totalUnread = unreadMessages.reduce((sum, msg) => sum + msg.unread_count, 0);

    useEffect(() => {
        if (!userId) return;
        if (!showMenu && !sidebarOpen) return;

        const fetchRecentConversations = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const { data } = await api.get("/message/getUserRecentMessages", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    const unreadOnly = data.recent_messages.filter(
                        (c: { unread_count: number }) => c.unread_count > 0
                    );
                    dispatch(setNotifications(unreadOnly));
                }
            } catch {
                // Optional: suppress toast during hydration
            }
        };

        fetchRecentConversations();
    }, [userId, showMenu, sidebarOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpenChat = (userId: string) => {
        router.push(`/auth/chatBox/${userId}`);
        setShowMenu(false);
        if (setSidebarOpen) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className='relative cursor-pointer' ref={menuRef}>
            <div onClick={() => setShowMenu(prev => !prev)}>
                <Bell size={28} />

                {totalUnread > 0 && (
                    <div
                        className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-red-500
                         text-white flex items-center justify-center p-2.5"
                    >
                        <p className="text-sm font-semibold">{totalUnread}</p>
                    </div>
                )}
            </div>

            {showMenu && (
                <div
                    className="absolute top-full max-md:-right-20 md:right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border
                        border-gray-200 p-3 z-50"
                >
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                        Notifications
                    </p>

                    {unreadMessages.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-2">
                            All caught up
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {unreadMessages.map((msg, index) => (
                                <div
                                    key={index}
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
                                        <p className="text-xs text-gray-500">
                                            {msg.unread_count} unread message
                                            {msg.unread_count > 1 && "s"}
                                        </p>
                                        <span
                                            className='text-xs text-gray-400'
                                        >
                                            {moment(msg.latest_created_at).fromNow()}
                                        </span>
                                    </div>
                                    <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                        {msg.unread_count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Notification
