import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { getSavedPosts, getUserComments } from "../api/postApi";
import CaseCard from "../components/CaseCard";
import UploadCaseModal from "../components/UploadCaseModal";
import { Plus } from "lucide-react";

export default function Profile() {
    const [activeTab, setActiveTab] = useState("post");
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const navigate = useNavigate();

    const [savedPosts, setSavedPosts] = useState([]);
    const [loadingSaved, setLoadingSaved] = useState(false);

    const [userComments, setUserComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        loadUserData();
        loadUserPosts();
        loadSavedPosts();
        loadUserComments();
    }, []);

    const loadUserComments = async () => {
        try {
            setLoadingComments(true);
            const data = await getUserComments();
            setUserComments(data);
        } catch (error) {
            console.error("Error loading user comments:", error);
        } finally {
            setLoadingComments(false);
        }
    };

    const loadUserData = () => {
        const stored = localStorage.getItem("user");
        if (stored) {
            setUser(JSON.parse(stored));
        }
    };

    const loadSavedPosts = async () => {
        try {
            setLoadingSaved(true);
            const data = await getSavedPosts();
            setSavedPosts(data);
        } catch (error) {
            console.error("Error loading saved posts:", error);
        } finally {
            setLoadingSaved(false);
        }
    };

    const loadUserPosts = async () => {
        try {
            setLoading(true);
            const res = await API.get("/posts");
            console.log("All posts:", res.data);

            // Filter posts by logged-in user
            const userId = user?._id || JSON.parse(localStorage.getItem("user"))?._id;
            console.log("Current user ID:", userId);

            if (userId) {
                const userPosts = res.data.filter(post => post.user?._id === userId);
                console.log("User's posts:", userPosts);
                setPosts(userPosts);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error("Error loading posts:", error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const userLetter = user?.fullname?.charAt(0)?.toUpperCase() || "D";
    const BASE_URL = import.meta.env.VITE_API_URL;

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="">
                {/* Profile Header */}
                <div className="bg-white p-5 pb-1 rounded-2xl shadow mb-6">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-400 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                            {user?.profile_url ? (
                                <img
                                    src={`${BASE_URL}/${user.profile_url}`}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                userLetter
                            )}
                        </div>
                        <div>
                            <h2 className="text-base font-semibold">{user?.fullname || "Doctor"}</h2>
                            <p className="text-gray-500 text-xs">
                                ASSI ID: {user?.user_id || user?._id?.slice(-8) || "12233333"}
                            </p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mb-4">
                        <button
                            onClick={() => setOpenUploadModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                        >
                            Add Your Case <Plus size={16} />
                        </button>
                        <button
                            onClick={() => navigate("/settings")}
                            className="px-4 py-2 border border-gray-300 rounded-full cursor-pointer hover:bg-gray-50 text-sm font-medium"
                        >
                            Edit Profile
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 text-sm">
                        <button
                            onClick={() => setActiveTab("post")}
                            className={` ${activeTab === "post"
                                ? "border-b-3 border-blue-600 rounded-bl-sm rounded-br-sm text-blue-600 font-medium"
                                : "text-gray-600 cursor-pointer"
                                }`}
                        >
                            Post
                        </button>
                        <button
                            onClick={() => setActiveTab("comments")}
                            className={` ${activeTab === "comments"
                                ? "border-b-3 border-blue-600 rounded-bl-sm rounded-br-sm text-blue-600 font-medium"
                                : "text-gray-600 cursor-pointer"
                                }`}
                        >
                            Comments
                        </button>
                        <button
                            onClick={() => setActiveTab("saved")}
                            className={` ${activeTab === "saved"
                                ? "border-b-3 border-blue-600 rounded-bl-sm rounded-br-sm text-blue-600 font-medium"
                                : "text-gray-600 cursor-pointer"
                                }`}
                        >
                            Saved
                        </button>
                    </div>
                </div>

                {/* TAB CONTENT */}
                {activeTab === "post" && (
                    <div className="space-y-5">
                        {loading ? (
                            <div className="bg-white p-10 rounded-xl shadow text-center">
                                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading posts...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="bg-white p-10 rounded-xl shadow text-center text-gray-600">
                                <p className="text-lg font-semibold mb-2">No posts yet</p>
                                <p className="text-sm">Share your first case to get started!</p>
                                <button
                                    onClick={() => setOpenUploadModal(true)}
                                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2"
                                >
                                    Add Your Case <Plus size={16} />
                                </button>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <CaseCard
                                    key={post._id}
                                    data={post}
                                    onUpdate={(postToEdit) => {
                                        setEditingPost(postToEdit);
                                        setOpenUploadModal(true);
                                    }}
                                />
                            ))
                        )}
                    </div>
                )}

                {activeTab === "comments" && (
                    <div className="space-y-4">
                        {loadingComments ? (
                            <div className="bg-white p-10 rounded-xl shadow text-center">
                                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading comments...</p>
                            </div>
                        ) : userComments.length === 0 ? (
                            <div className="bg-white p-10 rounded-xl shadow text-center text-gray-600">
                                <p className="text-lg font-semibold mb-2">No comments yet</p>
                                <p className="text-sm">Join the discussion on cases!</p>
                            </div>
                        ) : (
                            userComments.map((comment) => (
                                <div key={comment._id} className="bg-white p-4 rounded-xl shadow border border-gray-100">
                                    <p className="text-gray-800 text-sm mb-2">{comment.text}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>On post: <span className="font-medium text-blue-600">{comment.post?.title || "Unknown Post"}</span></span>
                                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "saved" && (
                    <div className="space-y-5">
                        {loadingSaved ? (
                            <div className="bg-white p-10 rounded-xl shadow text-center">
                                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading saved cases...</p>
                            </div>
                        ) : savedPosts.length === 0 ? (
                            <div className="bg-white p-10 rounded-xl shadow text-center text-gray-600">
                                <p className="text-lg font-semibold mb-2">No saved cases yet</p>
                                <p className="text-sm">Bookmark cases to see them here.</p>
                            </div>
                        ) : (
                            savedPosts.map((post) => (
                                <CaseCard
                                    key={post._id}
                                    data={post}
                                    onUpdate={(postToEdit) => {
                                        setEditingPost(postToEdit);
                                        setOpenUploadModal(true);
                                    }}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Upload Case Modal */}
            <UploadCaseModal
                open={openUploadModal}
                onClose={() => {
                    setOpenUploadModal(false);
                    setEditingPost(null);
                    loadUserPosts();
                }}
                initialData={editingPost}
            />
        </div>
    );
}
