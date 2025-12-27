import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CaseCard from "../components/CaseCard";
import API from "../api/api";

export default function UserProfile() {
  const { id } = useParams(); // Get user ID from URL

  const [activeTab, setActiveTab] = useState("post");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadUserData();
  }, [id]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Fetch user details
      const userRes = await API.get(`/users/${id}`);
      console.log("User Data:", userRes.data);
      setUser(userRes.data);

      // Fetch all posts and filter by user
      const postRes = await API.get("/posts");
      console.log("All Posts:", postRes.data);

      const userPosts = postRes.data.filter(post =>
        post.user?._id === id || post.user === id
      );
      console.log("User Posts (Filtered):", userPosts);
      setPosts(userPosts);

    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* CONTENT WRAPPER */}
      <div className="">

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow mb-6 overflow-hidden">

          {/* Green Cover Section */}

          {/* Profile Content */}
          <div className="p-6 pb-1">
            <div className="flex items-center gap-5 mt-5">

              {/* Avatar */}
              <div className="w-20 h-20 bg-gray-300 rounded-full border-4 border-white overflow-hidden">
                {user.profile_url ? (
                  <img
                    src={`${BASE_URL}/${user.profile_url}`}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-blue-600 text-white text-2xl font-bold">
                    {user.fullname?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-xl font-semibold">{user.fullname}</h2>
                <p className="text-gray-600">ASSI ID: {user.user_id || "N/A"}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 flex gap-8 pb-2 text-gray-600 font-medium">
              <button
                onClick={() => setActiveTab("post")}
                className={` ${activeTab === "post"
                  ? "text-blue-600 border-b-3 rounded-bl-sm rounded-br-sm border-blue-600 cursor-pointer"
                  : "cursor-pointer"
                  }`}
              >
                Posts
              </button>

            </div>
          </div>
        </div>

        {/* TAB CONTENT */}
        {activeTab === "post" && (
          <div className="space-y-5">
            {posts.length === 0 ? (
              <div className="bg-white p-6 text-center rounded-xl shadow">
                No posts yet.
              </div>
            ) : (
              posts.map((p) => <CaseCard key={p._id} data={p} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
