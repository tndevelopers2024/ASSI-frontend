import { useState, useRef, useEffect } from "react";
import { Upload, SendHorizontal, X } from "lucide-react";
import { compressImage } from "../utils/imageUtils";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableImage } from "./SortableImage";
import { addComment } from "../api/postApi";
import toast from "react-hot-toast";
import { getSocket } from "../utils/socket";
import { usePosts } from "../context/PostContext";

export default function InlineCommentBox({ postId, onCommentAdded, parentCommentId, placeholder = "Write a Comment...", buttonText = "Post Comment", initialFocus = false, onClose }) {
    const socket = getSocket();
    const { syncPostUpdate } = usePosts();
    const [uploads, setUploads] = useState([]);
    const [comment, setComment] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [isFocused, setIsFocused] = useState(initialFocus);
    const [errorMessage, setErrorMessage] = useState("");
    const containerRef = useRef(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };

        if (isFocused) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isFocused]);

    // Sensors for DND
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 1000,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);

        if (uploads.length + files.length > 10) {
            toast.error("You can only upload up to 10 images.");
            return;
        }

        const compressionToast = files.some(f => f.type.startsWith("image/")) && files.length > 1
            ? toast.loading("Processing files...") : null;

        try {
            const processedFiles = await Promise.all(
                files.map(async (file) => {
                    const isImage = file.type.startsWith("image/");
                    const finalFile = isImage ? await compressImage(file) : file;
                    return {
                        file: finalFile,
                        preview: isImage ? URL.createObjectURL(finalFile) : null,
                        type: file.type,
                        name: file.name
                    };
                })
            );

            setUploads((prev) => [...prev, ...processedFiles]);
            setIsFocused(true);
            if (compressionToast) toast.success("Ready!", { id: compressionToast });
        } catch (err) {
            console.error("Processing failed", err);
            // Fallback
            const fallback = files.map(file => ({
                file,
                preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
                type: file.type,
                name: file.name
            }));
            setUploads((prev) => [...prev, ...fallback]);
            if (compressionToast) toast.error("Some files failed to process, using originals.", { id: compressionToast });
        }
    };

    const removeUpload = (index) => {
        setUploads((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setUploads((prev) => {
                const oldIndex = prev.findIndex((item) => item.preview === active.id);
                const newIndex = prev.findIndex((item) => item.preview === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    const handlePostComment = async () => {
        if (!comment.trim() && uploads.length === 0) {
            setErrorMessage("Please write a comment or upload a file.");
            return;
        }

        setIsPosting(true);
        setErrorMessage("");

        const formData = new FormData();
        formData.append("content", comment);
        if (parentCommentId) {
            formData.append("parentCommentId", parentCommentId);
        }

        uploads.forEach((u) => formData.append("files", u.file));

        try {
            const res = await addComment(postId, formData);

            setComment("");
            setUploads([]);
            setErrorMessage("");
            setIsFocused(false);
            if (onClose) onClose();

            if (onCommentAdded) await onCommentAdded();

            // 1. Immediate local update via context
            syncPostUpdate(postId, {
                commentCount: (res.post?.commentCount ?? res.commentCount) // If backend sends it
            });

            // 2. Broadcast for others
            socket.emit("comment:new", { ...res, postId });
        } catch (err) {
            console.error("Error posting comment:", err);
            setErrorMessage("Failed to post comment.");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`rounded-xl p-3 bg-gray-50 transition-all ${isFocused ? "shadow-sm ring-1 ring-blue-100" : ""}`}
        >

            {/* Input Area */}
            <textarea
                placeholder={placeholder}
                rows={isFocused || comment.length > 0 || uploads.length > 0 ? 2 : 1}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onFocus={() => setIsFocused(true)}
                className="w-full bg-transparent outline-none resize-none text-sm p-1"
                autoFocus={initialFocus}
            ></textarea>

            {/* Error Message */}
            {errorMessage && (
                <p className="text-red-500 mt-2 text-xs">{errorMessage}</p>
            )}

            {/* Uploaded Files Preview */}
            {uploads.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={uploads.map((u) => u.preview)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="mt-3 flex gap-2 flex-wrap">
                            {uploads.map((u, i) => (
                                <SortableImage
                                    key={u.preview}
                                    id={u.preview}
                                    src={u.preview}
                                    onRemove={() => removeUpload(i)}
                                // isSmall={true} // Check if SortableImage accepts this
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Action Bar - Only Visible When Focused or Has Content */}
            {(isFocused || comment.length > 0 || uploads.length > 0) && (
                <div className="flex items-center justify-between mt-3 animate-fadeIn">
                    {/* Upload Button */}
                    <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-800 transition">
                        <Upload size={16} />
                        <span className="text-xs font-medium">Upload Documents</span>
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
                        disabled={isPosting}
                        className={`
                            flex items-center gap-2 bg-blue-600 text-white px-4 py-2 cursor-pointer rounded-full text-xs font-medium 
                            hover:bg-blue-700 transition shadow-sm
                            ${isPosting ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                    >
                        {isPosting ? "Posting..." : buttonText}
                        <SendHorizontal size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}
