import { deleteComment } from "../api/postApi";
import { X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import { useEffect } from "react";

export default function Comments({ comments = [], postId, highlightCommentId, onCommentAdded, onReplyClick }) {
    const [visibleCount, setVisibleCount] = useState(2);
    const [showAllReplies, setShowAllReplies] = useState(false);
    const [imagePopup, setImagePopup] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // const [highlightCommentId, setHighlightCommentId] = useState(null);
    const [replyExpandState, setReplyExpandState] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const BASE_URL = import.meta.env.VITE_API_URL;

    // ✔ HOOK MUST BE HERE (before any return)
    useEffect(() => {
        if (highlightCommentId) {
            const el = document.getElementById(highlightCommentId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [highlightCommentId, comments]);

    // NOW it's safe to return early
    if (!comments || comments.length === 0) {
        return (
            <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Comments:</p>
                <p className="text-sm text-gray-500">No comments</p>
            </div>
        );
    }

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




    // Filter only parent comments (no parentComment)
    const parentComments = comments.filter(c => !c.parentComment);
    const displayedComments = parentComments.slice(0, visibleCount);
    const hasMore = parentComments.length > visibleCount;
    const remainingCount = parentComments.length - visibleCount;

    // Get replies for a specific comment
    const getReplies = (commentId) => {
        const allReplies = comments.filter(c => c.parentComment?._id === commentId);

        const isExpanded = replyExpandState[commentId];

        return isExpanded ? allReplies : allReplies.slice(0, 1);
    };
    const toggleReplies = (commentId) => {
        setReplyExpandState(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };


    const handleViewMore = () => {
        setVisibleCount(prev => prev + 2);
        setShowAllReplies(true);
    };

    const handleShowAll = () => {
        setVisibleCount(parentComments.length);
        setShowAllReplies(true);
    };

    const handleShowLess = () => {
        setVisibleCount(2);
        setShowAllReplies(false);
    };

    const openImagePopup = (comment, imageIndex = 0) => {
        setImagePopup(comment);
        setCurrentImageIndex(imageIndex);
    };

    const closeImagePopup = () => {
        setImagePopup(null);
        setCurrentImageIndex(0);
    };

    const nextImage = () => {
        if (imagePopup && imagePopup.files) {
            setCurrentImageIndex((prev) => (prev + 1) % imagePopup.files.length);
        }
    };

    const prevImage = () => {
        if (imagePopup && imagePopup.files) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? imagePopup.files.length - 1 : prev - 1
            );
        }
    };

    // Delete Handlers
    const handleDeleteClick = (commentId) => {
        setCommentToDelete(commentId);
        setDeleteModalOpen(true);
    };



    const confirmDelete = async () => {
        if (!commentToDelete) return;
        try {
            await deleteComment(commentToDelete);
            if (onCommentAdded) onCommentAdded(); // Refresh comments
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert("Failed to delete comment");
        } finally {
            setDeleteModalOpen(false);
            setCommentToDelete(null);
        }
    };

    const renderComment = (comment, isReply = false, depth = 0) => {
        const userName =
            typeof comment.user === "string"
                ? comment.user
                : comment.user?.fullname || comment.user?.name || "Anonymous";

        const userProfilePic = typeof comment.user === "object" ? comment.user?.profile_url : null;

        const commentText = comment.content || "";
        const commentTime = comment.createdAt
            ? new Date(comment.createdAt).toLocaleString()
            : "Just now";

        const commentImages = comment.files?.map(file => `${BASE_URL}/${file}`) || [];

        // Allow nested replies up to depth 3
        const replies = depth < 3 ? getReplies(comment._id) : [];
        const isOwner = currentUser._id === comment.user?._id || currentUser._id === comment.user;
        const isAdmin = currentUser.role === "admin" || currentUser.role === "superadmin";
        const canDelete = isOwner || isAdmin;

        return (
            <div key={comment._id} className={`relative ${isReply ? "ml-12 mt-4" : "mb-4"}`}>

                {/* Connector Line for Replies */}
                {isReply && (
                    <div className="absolute -left-8 -top-10 bottom-1/2 w-8 border-l-2 border-b-2 border-dashed border-gray-300 rounded-bl-2xl h-[calc(50%+20px)]"></div>
                )}

                <div className="bg-gray-100 rounded-2xl p-4 flex gap-3 items-start relative z-10 group">
                    {/* Avatar */}
                    <div
                        className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden cursor-pointer"
                        onClick={() => window.location.href = `/profile/${comment.user?._id}`}
                    >
                        {userProfilePic ? (
                            <img
                                src={`${BASE_URL}/${userProfilePic}`}
                                alt={userName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            userName.charAt(0)?.toUpperCase() || "?"
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <p
                                className="font-bold text-gray-900 cursor-pointer hover:underline max-md:text-[12px]"
                                onClick={() => window.location.href = `/profile/${comment.user?._id}`}
                            >
                                {userName}
                            </p>

                            {/* Delete Button */}
                            {canDelete && (
                                <button
                                    onClick={() => handleDeleteClick(comment._id)}
                                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                                    title="Delete comment"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        <p className="text-gray-700 mt-1 text-sm max-md:text-[10px] leading-relaxed">{commentText}</p>

                        {/* Comment Images */}
                        {commentImages.length > 0 && (
                            <div className="mt-3 flex gap-2 flex-wrap">
                                {commentImages.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`comment-img-${idx}`}
                                        className="w-20 h-20 rounded-lg object-cover border border-[#e5e7eb] cursor-pointer hover:opacity-80 transition"
                                        onClick={() => openImagePopup(comment, idx)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Footer: Time & Reply */}
                        <div className="flex gap-4 mt-3 text-xs max-md:text-[10px] text-gray-500 font-medium">
                            <span>{timeAgo(comment.createdAt)}</span>
                            <button
                                onClick={() => onReplyClick && onReplyClick(comment)}
                                className="text-gray-600 hover:text-blue-600 cursor-pointer"
                            >
                                Reply
                            </button>
                        </div>
                    </div>
                </div>

                {/* Render Replies */}
                {replies.length > 0 && (
                    <div className="mt-2">
                        {replies.map(reply => renderComment(reply, true, depth + 1))}
                    </div>
                )}
                {/* Show more / less replies button per comment */}
                {comments.filter(c => c.parentComment?._id === comment._id).length > replies.length || replyExpandState[comment._id] ? (
                    <button
                        onClick={() => toggleReplies(comment._id)}
                        className="text-xs text-gray-600 hover:text-blue-600 ml-12 cursor-pointer mt-1"
                    >
                        {replyExpandState[comment._id] ? "Show less replies" : "View more replies"}
                    </button>
                ) : null}


            </div>
        );
    };

    return (
        <div className="mt-4">
            <p className="text-sm font-semibold mb-3">Comments:</p>

            <div className="space-y-3">
                {displayedComments.map(comment => renderComment(comment))}
            </div>

            <div className="flex flex-wrap gap-3 mt-3">
                {/* View More Button */}
                {hasMore && (
                    <>
                        <button
                            onClick={handleViewMore}
                            className="flex items-center gap-2 text-xs max-md:text-[10px] text-gray-600 hover:text-blue-600 cursor-pointer"
                        >
                            View more comments <p className="max-md:hidden">({remainingCount} more)</p>
                        </button>

                        {/* Show All Button */}
                        <span className="text-gray-400">|</span>
                        <button
                            onClick={handleShowAll}
                            className="text-xs max-md:text-[10px] text-gray-600 hover:text-blue-600 cursor-pointer"
                        >
                            Show all comments
                        </button>
                    </>
                )}

                {/* Show Less Button */}
                {visibleCount > 2 && (
                    <button
                        onClick={handleShowLess}
                        className="text-xs max-md:text-[10px] text-gray-600 hover:text-blue-600 cursor-pointer"
                    >
                        Show less
                    </button>
                )}
            </div>

            {/* Image Popup Modal */}
            {imagePopup && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn"
                    onClick={closeImagePopup}
                >
                    <div
                        className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden border border-white/40 animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeImagePopup}
                            className="absolute top-4 right-4 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 transition z-10 cursor-pointer"
                        >
                            <X size={20} className="text-gray-700 cursor-pointer" />
                        </button>

                        {/* Image Display */}
                        <div className="relative bg-black/10 p-4 flex items-center justify-center">
                            <img
                                src={`${BASE_URL}/${imagePopup.files[currentImageIndex]}`}
                                alt="comment-image"
                                className="w-full max-h-[550px] rounded-xl shadow-lg object-contain"
                            />

                            {/* Navigation Arrows */}
                            {imagePopup.files.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 shadow-md backdrop-blur-md rounded-full p-3 hover:bg-white transition cursor-pointer"
                                    >
                                        <ChevronLeft size={26} className="text-gray-700" />
                                    </button>

                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 shadow-md backdrop-blur-md rounded-full p-3 hover:bg-white transition cursor-pointer"
                                    >
                                        <ChevronRight size={26} className="text-gray-700" />
                                    </button>

                                    {/* Counter */}
                                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm shadow-md">
                                        {currentImageIndex + 1} / {imagePopup.files.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Comment"
                message="Are you sure you want to delete this comment? This action cannot be undone."
            />
        </div>
    );
}
