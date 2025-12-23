import { usePosts } from "../context/PostContext";
import { useNavigate } from "react-router-dom";
import { SidebarSkeleton } from "./Skeleton";

export default function RightSidebar() {
  const navigate = useNavigate();
  const { recentPosts, loading } = usePosts();

  // Show the first 5 posts from the chronological list
  const recentItems = recentPosts.slice(0, 5);

  return (
    <div className="overflow-y-auto relative p-4 max-md:hidden">
      <div className="fixed">

        {/* Recent Posts */}
        <div className="mb-8 bg-white p-5 rounded-2xl shadow min-w-[350px]">
          <h2 className="font-semibold mb-3 text-[#2563eb]">Recent Posts</h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((n) => <SidebarSkeleton key={n} />)}
            </div>
          ) : recentItems.length === 0 ? (
            <p className="text-gray-500 text-sm">No posts found</p>
          ) : (
            <ul className="space-y-2">
              {recentItems.map((post) => (
                <li
                  key={post._id}
                  className="grid grid-cols-[1fr_auto] text-sm hover:text-blue-600 cursor-pointer"
                  onClick={() => navigate(`/post/${post._id}`)}
                >
                  <p className="whitespace-normal break-words">{post.title}</p>
                  <span className="text-blue-600 ml-4">Know More</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-8 bg-white p-5 rounded-2xl shadow min-w-[350px]">
          <h2 className="font-semibold mb-3 text-[#2563eb]">Recent Cases</h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((n) => <SidebarSkeleton key={n} />)}
            </div>
          ) : recentItems.length === 0 ? (
            <p className="text-gray-500 text-sm">No posts found</p>
          ) : (
            <ul className="space-y-2">
              {recentItems.map((post) => (
                <li
                  key={post._id}
                  className="grid grid-cols-[1fr_auto] text-sm hover:text-blue-600 cursor-pointer"
                  onClick={() => navigate(`/post/${post._id}`)}
                >
                  <p className="whitespace-normal break-words">{post.title}</p>
                  <span className="text-blue-600 ml-4">Know More</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
