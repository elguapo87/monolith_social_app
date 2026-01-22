"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react";
import UserCard from "@/components/UserCard";
import Loading from "@/components/Loading";
import api from "@/lib/axios";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";

type UserData = {
  _id: string;
  full_name: string;
  user_name: string;
  bio: string;
  profile_picture: string;
  location: string;
  followers: string[];
};

const Discover = () => {

  const { getToken } = useAuth();

  const [input, setInput] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentUsers = async () => {
    setLoading(true)
    const token = await getToken();

    try {
      const { data } = await api.get("/user/discoverRecent", {
        headers: { Authorization: `${token}` }
      });

      if (data.success) {
        setUsers(data.recentUsers);

      } else {
        toast.error(data.message);
      }
      
    } catch (error) {
      console.error(error, "Failed to fetch recent users");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If input is empty, clear results and stop
    if (input.trim() === "") {
      fetchRecentUsers();
      setLoading(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);

      const token = await getToken();

      try {
        const { data } = await api.post("/user/discoverUsers", { input }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success) {
          setUsers(data.users);
        }

      } catch (error) {
        console.error("Search failed:", error);

      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [input]);

  const isSearching = input.trim();

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* TITLE */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Discover People</h1>
          <p className="text-slate-600">Connect with amazing people and grow your network</p>
        </div>

        {/* SEARCH */}
        <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                onChange={(e) => setInput(e.target.value)}
                value={input}
                type="text"
                placeholder="Search people by name, username, bio, or location..."
                className="pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        {!isSearching && (
          <h2 className="text-lg max-md:text-center md:text-2xl font-semibold text-gray-600 mb-3">
            Recently joined users
          </h2>
        )}

        {isSearching && (
          <h2 className="text-lg max-md:text-center md:text-2xl font-semibold text-gray-600 mb-3">
            Search results for "{input}"
          </h2>
        )}
   
        <div className="flex flex-wrap gap-6">
          {users.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>

        {loading && <Loading height='60vh' />}
      </div>
    </div>
  )
}

export default Discover
