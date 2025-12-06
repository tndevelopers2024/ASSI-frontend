import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import API from "../api/api";
import CaseCard from "../components/CaseCard";

export default function PostDetails() {
  const { postId } = useParams();
  const location = useLocation();
  const [post, setPost] = useState(null);

  // Get commentId from URL
  const queryParams = new URLSearchParams(location.search);
  const highlightCommentId = queryParams.get("comment");

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const res = await API.get(`/posts/${postId}`);
      setPost(res.data);
    } catch (err) {
      console.error("Failed to load post:", err);
    }
  };

  if (!post) return <div className="p-6">Loading post...</div>;

  return (
    <div className="p-6">
      <CaseCard data={post} highlightCommentId={highlightCommentId} />
    </div>
  );
}
