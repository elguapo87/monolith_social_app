import { useEffect, useState } from "react"
import { assets, dummyRecentMessagesData } from "../../public/assets";
import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import api from "@/lib/axios";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { setNotifications } from "@/redux/slices/notificationSlice";

type RecentMessagesType = {
  latest_created_at: string | Date;
  latest_message: string;
  media_url: string | ""; 
  unread_count: number;
  user: {
    full_name: string
    profile_picture: string;
    user_name: string;
    _id: string;
  };
}

const RecentMessages = () => {

  const { getToken } = useAuth();

  const [messages, setMessages] = useState<RecentMessagesType[]>([]);

  const fetchRecentMessages = async () => {
    try {
      const token = await getToken();

      const { data } = await api.get("/message/getUserRecentMessages", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setMessages(data.recent_messages.slice(0, 5));

      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error("Failed to fetch messages");
    }
  };

  useEffect(() => {
    fetchRecentMessages();
  }, [getToken]);

  return messages.length > 0 && (
    <div className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800">
      <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>

      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {messages.map((message, index) => (
          <Link
            key={index}
            href={`/auth/chatBox/${message.user._id}`}
            className="flex items-start gap-2 py-2 hover:bg-slate-100"
          >
            <Image
              src={message.user.profile_picture || assets.avatar_icon}
              width={32}
              height={32}
              alt=""
              className="size-8 aspect-square rounded-full"
            />

            <div className="w-full">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{message.user.full_name}</p>
                <p className="text-[10px] text-slate-400">{moment(message.latest_created_at).fromNow()}</p>
              </div>

              <div className="flex justify-between">
                {message.latest_message === "Media" ? (
                  <Image src={message.media_url} alt="" width={32} height={20} className="w-8 h-5 object-contain" />
                ) : (
                  <p className="text-gray-500">{message.latest_message.slice(0, 20)}</p>
                )}
                {message.unread_count > 0 && (
                  <p className="bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]">
                    {message.unread_count}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RecentMessages