import { usePosts } from "../context/PostContext";
import { useNavigate } from "react-router-dom";
import { SidebarSkeleton } from "./Skeleton";
import { Heart, MessageCircle } from "lucide-react";

export default function RightSidebar() {
  const navigate = useNavigate();
  const { recentPosts, loading } = usePosts();

  // Show the first 5 posts from the chronological list
  const recentItems = recentPosts.slice(0, 4);


  const timeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="sticky top-0 h-[calc(100vh-120px)] overflow-y-auto p-4 max-md:hidden custom-scrollbar">

      {/* Recent Posts */}
      <div className="mb-8 min-w-[350px] ">
        <h2 className="font-semibold mb-3 text-[#2563eb]">Recent Cases</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((n) => <SidebarSkeleton key={n} />)}
          </div>
        ) : recentItems.length === 0 ? (
          <p className="text-gray-500 text-sm">No posts found</p>
        ) : (
          <ul className="space-y-4">
            {recentItems.map((post) => (
              <li
                key={post._id}
                className="flex flex-col gap-2 cursor-pointer pb-3 hover:bg-gray-50 transition bg-white  p-5 rounded-2xl shadow"
                onClick={() => navigate(`/post/${post._id}`)}
              >
                {/* Header: Avatar + Info */}
                <div className="flex items-center gap-3 ">
                  <div
                    className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-red-400 flex items-center justify-center text-white font-bold text-sm cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      const userId = post.user?._id || post.user;
                      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                      if (userId === currentUser._id) {
                        navigate("/profile");
                      } else {
                        navigate(`/profile/${userId}`);
                      }
                    }}
                  >
                    {post.user?.profile_url ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${post.user.profile_url}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (post.user?.fullname?.charAt(0) || "?").toUpperCase()
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-1 text-[13px] text-gray-800">
                      <span
                        className="font-bold hover:underline cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          const userId = post.user?._id || post.user;
                          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                          if (userId === currentUser._id) {
                            navigate("/profile");
                          } else {
                            navigate(`/profile/${userId}`);
                          }
                        }}
                      >
                        {post.user?.fullname || "Unknown"}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{timeAgo(post.createdAt)}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">
                        {Array.isArray(post.category)
                          ? (post.category.length > 1
                            ? `${post.category[0]} +${post.category.length - 1}`
                            : post.category[0])
                          : post.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400 flex-1">ASSI ID: {post.user?.user_id || "N/A"}</span>
                      <span className="text-blue-600 text-sm font-medium hover:underline">Know More</span>
                    </div>
                  </div>
                </div>

                {/* Title & Stats */}
                <div className="ml-1">
                  <p className="font-semibold text-sm text-gray-900 leading-tight mb-2 break-words line-clamp-2">{post.title}</p>

                  <div className="flex items-center gap-4 text-gray-400">
                    {/* <div className="flex items-center gap-1">
                      <Heart size={14} className={(post.likesCount > 0 || post.likes?.length > 0) ? "fill-red-500 text-red-500" : ""} />
                      <span className="text-xs font-medium">{post.likesCount ?? post.likes?.length ?? 0}</span>
                    </div> */}
                    <div className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      <span className="text-xs font-medium">
                        {post.commentsCount ?? post.commentCount ?? post.comments?.length ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
