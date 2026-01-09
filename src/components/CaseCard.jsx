import { useState, useRef, useEffect } from "react";
import ImageGrid from "./ImageGrid";
import Comments from "./Comments";
import CommentModal from "./CommentModal";
import ConfirmationModal from "./ConfirmationModal";
import { MoreVertical, Trash2, Edit, Bookmark, Heart, MessageSquare, Share2 } from "lucide-react";
import ShareModal from "./ShareModal";
import API from "../api/api";
import { getComments, deletePost, toggleSavePost, toggleLikePost } from "../api/postApi";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import InlineCommentBox from "./InlineCommentBox";
import { getSocket } from "../utils/socket";
import { usePosts } from "../context/PostContext";
import { renderTextWithLinks } from "../utils/textUtils";


export default function CaseCard({ data, onDelete, onUpdate, onLike, highlightCommentId }) {
    const socket = getSocket();
    const { refreshPosts, syncPostUpdate } = usePosts();
    if (!data) return null;
    const location = useLocation();
    const navigate = useNavigate();
    const [openModal, setOpenModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [replyingToComment, setReplyingToComment] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const menuRef = useRef(null);
    const BASE_URL = import.meta.env.VITE_API_URL;

    // Get current logged-in user
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = currentUser._id || currentUser.id;
    const isOwner = currentUserId === (data.user?._id || data.user);
    const userRole = currentUser.role?.toLowerCase();
    const isAdmin = userRole === "admin" || userRole === "superadmin" || userRole === "super_admin" || userRole === "super admin";

    // Debug role if needed
    // console.log(`User: ${currentUser.fullname}, Role: ${currentUser.role}, isOwner: ${isOwner}, isAdmin: ${isAdmin}`);

    // Initialize isSaved & isLiked state
    useEffect(() => {
        if (currentUser.savedPosts && currentUser.savedPosts.includes(data._id)) {
            setIsSaved(true);
        }

        // Initialize likes from the data prop (which is kept in sync by PostContext)
        setLikesCount(data.likesCount ?? data.likes?.length ?? 0);
        setIsLiked(data.likes?.some(id => (id._id || id) === currentUserId) || false);
    }, [data._id, data.likes, data.likesCount, currentUserId]);

    const handleSave = async () => {
        // Optimistic update
        const newSavedState = !isSaved;
        setIsSaved(newSavedState);

        try {
            await toggleSavePost(data._id);

            // Update local storage to keep sync
            const updatedUser = { ...currentUser };
            if (!updatedUser.savedPosts) updatedUser.savedPosts = [];

            if (newSavedState) {
                if (!updatedUser.savedPosts.includes(data._id)) {
                    updatedUser.savedPosts.push(data._id);
                }
            } else {
                updatedUser.savedPosts = updatedUser.savedPosts.filter(id => id !== data._id);
            }

            localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (error) {
            console.error("Error saving post:", error);
            setIsSaved(!newSavedState); // Revert on error
        }
    };

    const handleLike = async () => {
        // Optimistic update
        const newLikeState = !isLiked;
        setIsLiked(newLikeState);
        setLikesCount(prev => newLikeState ? prev + 1 : prev - 1);

        try {
            const res = await toggleLikePost(data._id);

            // 1. Calculate updated likes array locally (since backend only returns count/status)
            let updatedLikes = [...(data.likes || [])];
            if (res.isLiked) {
                if (!updatedLikes.some(id => (id._id || id) === currentUserId)) {
                    updatedLikes.push(currentUserId);
                }
            } else {
                updatedLikes = updatedLikes.filter(id => (id._id || id) !== currentUserId);
            }

            const updatedData = {
                likes: updatedLikes,
                likesCount: res.likesCount
            };

            // 2. Immediate local update via context
            syncPostUpdate(data._id, updatedData);

            // 3. Notify parent if needed (e.g. PostDetails)
            if (onLike) onLike({ ...data, ...updatedData });

            // 4. Broadcast for others
            socket.emit("post:liked", { ...data, ...updatedData });
        } catch (error) {
            console.error("Error liking post:", error);
            // Revert on error
            setIsLiked(!newLikeState);
            setLikesCount(prev => newLikeState ? prev - 1 : prev + 1);
        }
    };

    // ... (rest of the component logic: fetchComments, etc.)

    // (keep existing helper functions like timeAgo, etc.)

    // Fetch comments for this post
    useEffect(() => {
        const fetchComments = async () => {
            try {
                setLoadingComments(true);
                const fetchedComments = await getComments(data._id);
                setComments(fetchedComments);
            } catch (error) {
                console.error("Error fetching comments:", error);
                setComments([]);
            } finally {
                setLoadingComments(false);
            }
        };

        if (data._id) {
            fetchComments();
        }
    }, [data._id]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Profile image fix & post images fix (keep existing)
    const profileImage = data.user?.profile_url ? `${BASE_URL}/${data.user.profile_url}` : null;
    const postImages = data.images?.map((img) => `${BASE_URL}/${img}`);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const handleDeleteClick = () => { setDeleteModalOpen(true); setShowMenu(false); };
    const confirmDelete = async () => {
        try {
            await deletePost(data._id);
            toast.success("Post deleted successfully!", { position: "top-center" });
            if (onDelete) onDelete(data._id);
        } catch (error) {
            toast.error("Failed to delete post!", { position: "top-center" });
        } finally {
            setDeleteModalOpen(false);
        }
    };
    const handleEdit = () => { if (onUpdate) onUpdate(data); setShowMenu(false); };

    const handleShare = () => {
        setIsShareModalOpen(true);
    };

    const postUrl = `${window.location.origin}/post/${data._id}`;

    // timeAgo function ... (omitted for brevity in replacement block, assuming it is preserved or needs to be re-inserted if I am replacing the whole block. 
    // Wait, replace_file_content replaces a block. I need to be careful not to delete timeAgo if I don't include it. 
    // The instructions say "ReplacementContent" must be complete drop-in. 
    // I will include the timeAgo function to be safe, or scope the edit to the top imports and the rendering part separately using multi_replace?
    // The imports are at the top, and the rendering at the bottom. The state init is in the middle.
    // I'll use multi_replace to be surgical.)


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
        <>
            <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200">

                {/* HEADER */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">

                        {/* Profile image OR first letter */}
                        <div
                            className="w-10 h-10 rounded-full overflow-hidden bg-red-400 flex items-center justify-center text-white font-semibold text-lg cursor-pointer"
                            onClick={() => {
                                const userId = data.user?._id || data.user;
                                if (userId === currentUser._id) {
                                    navigate("/profile");
                                } else {
                                    navigate(`/profile/${userId}`);
                                }
                            }}
                        >
                            {data.user?.profile_url ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/${data.user.profile_url}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                (data.user?.fullname?.charAt(0) || "?").toUpperCase()
                            )}
                        </div>

                        {/* Name + time + tag + ID */}
                        <div className="flex flex-col">

                            {/* Line 1 → Name • 1 hr ago */}
                            <div className="flex items-center gap-2 text-sm">

                                <span
                                    className="font-semibold text-[15px] max-md:text-[12px] cursor-pointer hover:underline"
                                    onClick={() => {
                                        const userId = data.user?._id || data.user;
                                        if (userId === currentUser._id) {
                                            navigate("/profile");
                                        } else {
                                            navigate(`/profile/${userId}`);
                                        }
                                    }}
                                >
                                    {data.user.fullname}
                                </span>

                                <span className="text-gray-500">•</span>
                                <span className="text-gray-500">{timeAgo(data.createdAt)}</span>
                            </div>

                            {/* Line 2 → Tags */}


                            {/* Line 3 → ASSI ID */}
                            <span className="text-gray-400 text-xs">
                                ASSI ID: {data.user.user_id}
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {Array.isArray(data.category) ? (
                                    <>
                                        {data.category.slice(0, 2).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {data.category.length > 2 && (
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                                +{data.category.length - 2} more
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                        {data.category}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* 3-dot Menu - Show for post owner OR admin */}
                    {(isOwner || isAdmin) && (
                        <div className="relative" ref={menuRef}>
                            {/* Trigger Button */}
                            <MoreVertical
                                className="text-gray-500 cursor-pointer hover:text-gray-700 transition"
                                onClick={() => setShowMenu(!showMenu)}
                            />

                            {/* Dropdown */}
                            {showMenu && (
                                <div
                                    className="
                                    absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20
                                    animate-dropdown
                                    overflow-hidden
                                "
                                >
                                    {isOwner && (
                                        <button
                                            onClick={handleEdit}
                                            className="
                                            w-full flex items-center gap-3 px-4 py-2.5 
                                            text-sm text-gray-700 
                                            hover:bg-gray-100 
                                            transition-all
                                        "
                                        >
                                            <Edit size={16} className="text-gray-600" />
                                            Edit Post
                                        </button>
                                    )}

                                    <button
                                        onClick={handleDeleteClick}
                                        className="
                                            w-full flex items-center gap-3 px-4 py-2.5 
                                            text-sm text-red-600
                                            hover:bg-red-50
                                            transition-all cursor-pointer
                                        "
                                    >
                                        <Trash2 size={16} className="text-red-600" />
                                        Delete Post
                                    </button>
                                </div>
                            )}

                            {/* Smooth Fade/Slide Animation */}
                            <style>{`
                            .animate-dropdown {
                                animation: dropdownAnim 0.15s ease-out;
                            }
                            @keyframes dropdownAnim {
                                from {
                                opacity: 0;
                                transform: translateY(-5px);
                                }
                                to {
                                opacity: 1;
                                transform: translateY(0);
                                }
                            }
                            `}</style>
                        </div>
                    )}

                </div>

                {/* CONTENT */}
                <div className="mt-3">
                    <h3 className="font-semibold text-[15px]">{data.title}</h3>
                    <div className="mt-1">
                        <p
                            className={`text-gray-700 text-[14px] leading-relaxed whitespace-pre-line ${expanded ? "" : "line-clamp-4"
                                }`}
                        >
                            {renderTextWithLinks(data.content)}
                        </p>

                        {/* See more / See less button */}
                        {data.content?.length > 150 && (
                            <button
                                className="text-blue-600 text-sm font-semibold mt-1 cursor-pointer"
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? "Read less" : "Read more"}
                            </button>
                        )}
                    </div>

                </div>

                {/* IMAGE GRID */}
                {postImages?.length > 0 && (
                    <div className="mt-3">
                        <ImageGrid images={postImages} postContent={data.content} />
                    </div>
                )}

                {/* COMMENT BOX AND SAVE BUTTON */}
                <div className="mt-4 flex items-start gap-3">
                    <div className="flex items-center gap-1 mt-1.5 ">
                        <button
                            onClick={handleLike}
                            className={`group flex items-center gap-1.5 transition-all px-3 py-3 cursor-pointer rounded-full ${isLiked ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                            title={isLiked ? "Unlike" : "Like"}
                        >
                            <Heart
                                size={20}
                                className={`transition-all ${isLiked ? "fill-red-600 text-red-600 scale-110" : "text-gray-500 group-hover:text-red-500"}`}
                            />
                            {likesCount > 0 && (
                                <span className="text-sm font-medium">{likesCount}</span>
                            )}
                        </button>

                        <div
                            className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-3 rounded-full"
                        >
                            <MessageSquare size={20} className="text-gray-500" />
                            <span className="text-sm font-medium">
                                {data.commentsCount ?? data.commentCount ?? data.comments?.length ?? 0}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1">
                        {currentUser.membership_category !== "LIFE" ? (
                            <InlineCommentBox
                                postId={data._id}
                                onCommentAdded={async () => {
                                    const fetchedComments = await getComments(data._id);
                                    setComments(fetchedComments);
                                }}
                            />
                        ) : (
                            <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-500 italic">
                                LIFE members can only view and like posts.
                            </div>
                        )}
                    </div>

                    <button
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer flex-shrink-0 mt-1 bg-gray-100 text-gray-600 hover:bg-gray-200`}
                        onClick={handleShare}
                        title="Share Post"
                    >
                        <Share2 size={20} />
                    </button>

                    <button
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer flex-shrink-0 mt-1 ${isSaved ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        onClick={handleSave}
                        title={isSaved ? "Unsave Post" : "Save Post"}
                    >
                        <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
                    </button>
                </div>

                {/* SHARE MODAL */}
                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    postUrl={postUrl}
                    postTitle={data.title}
                />

                {/* COMMENTS LIST */}
                <Comments
                    comments={comments}
                    postId={data._id}
                    highlightCommentId={highlightCommentId}  // ⭐ FIX
                    onCommentAdded={async () => {
                        const fetchedComments = await getComments(data._id);
                        setComments(fetchedComments);
                    }}
                    onReplyClick={(comment) => {
                        setReplyingToComment(comment);
                        setOpenModal(true);
                    }}
                />

            </div>

            {/* COMMENT MODAL */}
            <CommentModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setReplyingToComment(null);
                }}
                data={{
                    _id: data._id,
                    user: data.user,  // ← FULL USER OBJECT WITH profile_url
                    createdAt: data.createdAt,      // ✅ FIXED
                    description: data.content,
                    images: postImages,
                    comments: comments,
                    title: data.title,
                    likes: data.likes,
                    likesCount: likesCount,
                    isLiked: isLiked
                }}
                handleLike={handleLike}
                replyingTo={replyingToComment}
                onCommentAdded={async () => {
                    // Refresh comments after adding new one
                    const fetchedComments = await getComments(data._id);
                    setComments(fetchedComments);
                }}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
            />
        </>
    );
}
