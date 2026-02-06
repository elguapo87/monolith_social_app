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

type SidebarProps = {
    sidebarOpen?: boolean;
    setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Notification = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();
    const { unread: unreadMessages } = useSelector((state: RootState) => state.notifications);

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    const totalUnread = unreadMessages.reduce((sum, msg) => sum + msg.unread_count, 0);

    useEffect(() => {
        getToken().then((token) => {
            dispatch(fetchRecentConversations(token));
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
                                            {moment(msg.last_message_date).fromNow()}
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
