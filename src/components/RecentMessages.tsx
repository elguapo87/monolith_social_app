import { useEffect } from "react"
import { assets } from "../../public/assets";
import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import api from "@/lib/axios";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getUserRecentMessages } from "@/redux/slices/messageSlice";

const RecentMessages = () => {

  const { getToken } = useAuth();
  const { recentConversations: messages } = useSelector((state: RootState) => state.message);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    getToken().then((token) => {
      dispatch(getUserRecentMessages(token));
    });
  }, [getToken, dispatch]);

  return messages.length > 0 && (
    <div className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800">
      <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>

      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {messages.map((message, index) => (
          <Link
            key={index}
            href={`/auth/chatBox/${message.user._id}`}
            className="flex items-start gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-100"
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
                  <p className="bg-red-500 text-white size-4 flex items-center justify-center rounded-full text-[10px]">
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