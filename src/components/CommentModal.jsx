import { X, Upload, SendHorizontal } from "lucide-react";
import { useState } from "react";
import ImageGrid from "./ImageGrid";
import Comments from "./Comments";
import { addComment } from "../api/postApi";

export default function CommentModal({
    open,
    onClose,
    data,
    onCommentAdded,
    replyingTo,
}) {
    const [uploads, setUploads] = useState([]);
    const [comment, setComment] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const firstLetter = data.user?.fullname?.[0]?.toUpperCase() || "?";

    const profileUrl = data.user?.profile_url?.startsWith("http")
        ? data.user.profile_url
        : `${import.meta.env.VITE_API_URL}/${data.user?.profile_url?.replace(/^\/+/, "")}`;

    if (!open) return null;

    const handleUpload = (e) => {
        const files = Array.from(e.target.files);

        const mapped = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type,
        }));

        setUploads([...uploads, ...mapped]);
    };

    const removeUpload = (index) => {
        setUploads(uploads.filter((_, i) => i !== index));
    };

    const handlePostComment = async () => {
        if (!comment.trim() && uploads.length === 0) return;

        const formData = new FormData();
        formData.append("content", comment);

        if (replyingTo) formData.append("parentCommentId", replyingTo._id);

        uploads.forEach((u) => formData.append("files", u.file));

        try {
            await addComment(data._id, formData);

            setComment("");
            setUploads([]);

            if (onCommentAdded) await onCommentAdded();
            onClose();
        } catch (err) {
            console.error("Error posting comment:", err);
            alert("Failed to post comment");
        }
    };

    const shortText = data.description?.slice(0, 180);

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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 h-full">
            <div className="bg-white w-[700px] rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.15)] p-6 relative overflow-y-auto max-h-[90vh] hide-scrollbar">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-600 hover:text-black cursor-pointer"
                >
                    <X size={22} />
                </button>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">

                        {!imgError && data.user?.profile_url ? (
                            <img
                                src={profileUrl}
                                onError={() => setImgError(true)}
                                className="w-10 h-10 rounded-full object-cover"
                                alt="Profile"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[#ff6467] flex items-center justify-center text-lg text-white font-semibold">
                                {firstLetter}
                            </div>
                        )}


                        <div>
                            <p className="font-semibold text-[15px] max-md:text-[12px]">
                                {data.user?.fullname}
                            </p>
                            <p className="text-gray-500 text-xs">{timeAgo(data.createdAt)}</p>
                        </div>

                    </div>

                </div>

                {/* Title */}
                <h2 className="text-[17px] font-semibold mt-4">{data.title}</h2>

                {/* Description + See more */}
                <p className={`text-gray-700 mt-2 ${expanded ? "" : "line-clamp-3"}`}>
                    {expanded ? data.description : shortText}
                </p>

                {data.description.length > 180 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-blue-600 text-sm font-medium mt-1"
                    >
                        {expanded ? "See less" : "See more"}
                    </button>
                )}

                {/* Image Grid */}
                {data.images?.length > 0 && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                        <ImageGrid images={data.images} />
                    </div>
                )}

                {/* Uploaded Files Preview */}
                {/* Uploaded Files Preview (Stylish + Drag to Reorder) */}
                {uploads.length > 0 && (
                    <div className="mt-4 flex gap-3 flex-wrap">
                        {uploads.map((u, i) => (
                            <div
                                key={i}
                                className="relative group cursor-move"
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData("index", i)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    const from = e.dataTransfer.getData("index");
                                    const to = i;
                                    if (from === to) return;

                                    // Handle reorder
                                    const updated = [...uploads];
                                    const movedItem = updated[from];
                                    updated.splice(from, 1);
                                    updated.splice(to, 0, movedItem);

                                    setUploads(updated);
                                }}
                            >
                                {/* Preview Image */}
                                <img
                                    src={u.preview}
                                    className="w-14 h-14 rounded-xl border border-[#e5e7eb] object-cover shadow-sm"
                                />

                                {/* Clean X Button */}
                                <button
                                    onClick={() => removeUpload(i)}
                                    className="
            absolute -top-2 -right-2 
            w-5 h-5 flex items-center justify-center 
            bg-white text-gray-700 rounded-full shadow-md 
            opacity-0 group-hover:opacity-100 transition
          "
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}


                {/* Comment Input Box */}
                <div className="mt-5 rounded-xl p-3 bg-gray-50">

                    <textarea
                        placeholder="Write a Comment..."
                        rows={2}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-3 rounded-lg outline-none resize-none"
                    ></textarea>

                    <div className="flex items-center justify-between mt-3">

                        {/* Upload Button */}
                        <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-black">
                            <Upload size={18} />
                            <span>Upload Documents</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*,.pdf,.doc,.docx"
                                onChange={handleUpload}
                                className="hidden"
                            />
                        </label>

                        {/* Post Button */}
                        <button
                            onClick={handlePostComment}
                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full cursor-pointer hover:bg-blue-700"
                        >
                            Post Comment <SendHorizontal />
                        </button>

                    </div>
                </div>

                {/* Comments List */}
                <div className="mt-6">
                    <Comments comments={data.comments} />
                </div>
            </div>
        </div>
    );
}
