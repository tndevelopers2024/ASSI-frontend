import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import CaseCard from "../components/CaseCard";
import UploadCaseModal from "../components/UploadCaseModal";
import { Helmet } from "react-helmet-async";

export default function PostDetails() {
  const { postId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Extract commentId from URL
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
      <Helmet>
        <title>{post.title} | ASSI</title>
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.content?.substring(0, 150) + "..."} />
        <meta property="og:image" content={post.images?.[0] ? `${import.meta.env.VITE_API_URL}/${post.images[0]}` : "/logo.png"} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.content?.substring(0, 150) + "..."} />
        <meta name="twitter:image" content={post.images?.[0] ? `${import.meta.env.VITE_API_URL}/${post.images[0]}` : "/logo.png"} />
      </Helmet>
      <CaseCard
        data={post}
        highlightCommentId={highlightCommentId}
        onUpdate={(postToEdit) => {
          setEditingPost(postToEdit);
          setUploadModalOpen(true);
        }}
        onDelete={() => {
          navigate("/");
        }}
      />

      {/* Upload/Edit Modal */}
      <UploadCaseModal
        open={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setEditingPost(null);
          loadPost(); // Refresh post data after edit
        }}
        initialData={editingPost}
      />
    </div>
  );
}
