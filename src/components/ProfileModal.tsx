import { useState } from "react";
import { assets } from "../../public/assets";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useAuth } from "@clerk/nextjs";
import { updateProfile } from "@/redux/slices/userSlice";
import toast from "react-hot-toast";

type ProfileProps = {
    setShowEdit: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProfileModal = ({ setShowEdit }: ProfileProps) => {

    const { value: user, loading } = useSelector((state: RootState) => state.user);
    const { getToken } = useAuth();
    const dispatch = useDispatch<AppDispatch>();

    const [editForm, setEditForm] = useState<{
        user_name: string;
        bio: string;
        location: string;
        cover_photo: File | null;
        full_name: string;
    }>({
        user_name: user?.user_name ?? "",
        bio: user?.bio ?? "",
        location: user?.location ?? "",
        cover_photo: null,
        full_name: user?.full_name ?? ""
    });

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = await getToken() as string;

        const formData = new FormData();
        formData.append("full_name", editForm.full_name);
        formData.append("user_name", editForm.user_name);
        formData.append("location", editForm.location);
        formData.append("bio", editForm.bio);

        editForm.cover_photo && formData.append("cover", editForm.cover_photo);

        try {
            await dispatch(updateProfile({ userData: formData, token }));
            setShowEdit(false);

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }

    };

    const previewCoverPhoto =
        editForm.cover_photo
            ? URL.createObjectURL(editForm.cover_photo)
            : user?.cover_photo
                ? user.cover_photo
                : assets.image_placeholder

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50">
            <div className="max-w-2xl sm:py-6 mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        {/* PROFILE PICTURE (Clerk-managed) */}
                        <div className="flex flex-col items-start gap-3">
                            <span className="block text-sm font-medium text-gray-700">
                                Profile Picture
                            </span>

                            <Image
                                src={user?.profile_picture || assets.avatar_icon}
                                alt="Profile picture"
                                width={96}
                                height={96}
                                className="size-24 rounded-full object-cover mt-2 opacity-80 cursor-not-allowed"
                            />

                            <p className="text-xs text-gray-500 max-w-xs">
                                Profile picture is managed via account settings.
                            </p>
                        </div>

                        {/* COVER PHOTO */}
                        <div className="flex flex-col items-start gap-3">
                            <label
                                htmlFor="cover_photo"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Cover Photo
                                <input
                                    onChange={(e) => setEditForm((prev) => ({
                                        ...prev, cover_photo: e.target.files && e.target.files[0]
                                    }))}
                                    type="file"
                                    accept="image/*"
                                    id="cover_photo"
                                    hidden
                                />
                                <div className="group/hover relative">
                                    <Image
                                        src={previewCoverPhoto}
                                        alt=""
                                        width={320}
                                        height={160}
                                        className="w-80 h-40 rounded-lg bg-linear-to-r from-indigo-200
                                        via-purple-200 to-pink-200 object-cover mt-2"
                                    />
                                    <div
                                        className="absolute hidden group-hover/hover:flex top-0 left-0 right-0
                                            bottom-0 bg-black/20 rounded-lg items-center justify-center"
                                    >
                                        <Pencil className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                onChange={(e) => setEditForm((prev) => ({
                                    ...prev, full_name: e.target.value
                                }))}
                                value={editForm.full_name}
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg"
                                placeholder="Please enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                onChange={(e) => setEditForm((prev) => ({
                                    ...prev, user_name: e.target.value
                                }))}
                                value={editForm.user_name}
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg"
                                placeholder="Please enter a username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                rows={3}
                                onChange={(e) => setEditForm((prev) => ({
                                    ...prev, bio: e.target.value
                                }))}
                                value={editForm.bio}
                                className="w-full p-3 border border-gray-200 rounded-lg"
                                placeholder="Please enter a short bio"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                onChange={(e) => setEditForm((prev) => ({
                                    ...prev, location: e.target.value
                                }))}
                                value={editForm.location}
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg"
                                placeholder="Please enter your location"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-6">
                            <button
                                onClick={() => setShowEdit(false)}
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700
                                hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-600
                                 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700
                                  transition cursor-pointer"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ProfileModal
