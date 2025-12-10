import { useEffect, useState } from "react";
import { getAllPosts } from "../api/postApi";
import { useNavigate } from "react-router-dom";

export default function RightSidebar() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      // ✅ getAllPosts() RETURNS THE ARRAY DIRECTLY
      const data = await getAllPosts();

      console.log("Sidebar posts:", data);  // SHOULD SHOW ARRAY OF POSTS

      setPosts(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Sidebar post fetch error:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-y-auto relative p-4 max-md:hidden">
      <div className="fixed">

        {/* Recent Posts */}
        <div className="mb-8 bg-white p-5 rounded-2xl shadow min-w-[350px]">
          <h2 className="font-semibold mb-3 text-[#2563eb]">Recent Posts</h2>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : posts.length === 0 ? (
            <p className="text-gray-500 text-sm">No posts found</p>
          ) : (
            <ul className="space-y-2">
              {posts.map((post) => (
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
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : posts.length === 0 ? (
            <p className="text-gray-500 text-sm">No posts found</p>
          ) : (
            <ul className="space-y-2">
              {posts.map((post) => (
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
