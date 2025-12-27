import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import CaseCard from "../components/CaseCard";
import UploadCaseModal from "../components/UploadCaseModal";

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
