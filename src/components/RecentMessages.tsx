import { useEffect, useState } from "react"
import { dummyRecentMessagesData } from "../../public/assets";
import Link from "next/link";
import Image from "next/image";
import moment from "moment";

type RecentMessagesType = typeof dummyRecentMessagesData;

const RecentMessages = () => {

  const [messages, setMessages] = useState<RecentMessagesType>([]);

  const fetchRecentMessages = async () => {
    setMessages(dummyRecentMessagesData);
  };

  useEffect(() => {
    fetchRecentMessages();
  }, []);

  return (
    <div className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800">
      <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>

      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {messages.map((message, index) => (
          <Link 
            key={index} 
            href={`/auth/chatBox/${message._id}`} 
            className="flex items-start gap-2 py-2 hover:bg-slate-100"
          >
            <Image 
              src={message.from_user_id.profile_picture}
              width={32} 
              height={32} 
              alt="" 
              className="size-8 aspect-square rounded-full" 
            />

            <div className="w-full">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{message.from_user_id.full_name}</p>
                <p className="text-[10px] text-slate-400">{moment(message.createdAt).fromNow()}</p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-500">{message.text ? message.text : "Media"}</p>
                {
                  !message.seen 
                    && 
                  <p className="bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]">
                    1
                  </p>
                }
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RecentMessages