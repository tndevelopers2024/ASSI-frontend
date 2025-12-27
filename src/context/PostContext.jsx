import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllPosts } from "../api/postApi";
import { getSocket } from "../utils/socket";

const PostContext = createContext();

export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const shuffleArray = (array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    };

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await getAllPosts();

            // 1. Preserve counts from current state to prevent "clobbering"
            setPosts((currentPosts) => {
                const updated = data.map(p => {
                    const existing = currentPosts.find(ep => ep._id === p._id);

                    // Logic: Prefer backend comments if they exist, otherwise preserve our local count
                    const hasBackendComments = p.comments && p.comments.length > 0;

                    // Backend sends 'commentsCount', frontend uses 'commentCount'
                    const backendCount = p.commentsCount ?? p.commentCount ?? p.comments?.length ?? 0;
                    const finalCommentCount = backendCount > 0 ? backendCount : (existing?.commentCount ?? 0);

                    const backendLikesCount = p.likesCount ?? p.likes?.length ?? 0;
                    const finalLikesCount = backendLikesCount > 0 ? backendLikesCount : (existing?.likesCount ?? 0);

                    return {
                        ...p,
                        commentCount: finalCommentCount,
                        likesCount: finalLikesCount,
                        comments: hasBackendComments ? p.comments : (existing?.comments || [])
                    };
                });

                const sorted = [...updated].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setRecentPosts(sorted);

                return shuffleArray(updated);
            });
        } catch (error) {
            console.error("Error loading posts in context:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();

        const socket = getSocket();

        socket.on("post:new", (post) => {
            const update = (prev) => {
                if (prev.some(p => p._id === post._id)) return prev;
                return [post, ...prev];
            };
            setPosts(update);
            setRecentPosts(update);
        });

        socket.on("post:updated", (updated) => {
            const update = (prev) => prev.map((p) => (p._id === updated._id ? { ...p, ...updated } : p));
            setPosts(update);
            setRecentPosts(update);
        });

        socket.on("post:deleted", (postId) => {
            const update = (prev) => prev.filter((p) => p._id !== postId);
            setPosts(update);
            setRecentPosts(update);
        });

        socket.on("comment:new", (data) => {
            const postId = data.postId || (data.post?._id || data.post);
            if (!postId) return;

            const update = (prev) => prev.map((p) => {
                if (p._id === postId) {
                    const existing = p.comments || [];
                    if (existing.some(c => (c._id || c) === data._id)) return p;

                    const newComments = [...existing, data];
                    return {
                        ...p,
                        comments: newComments,
                        commentCount: p.commentCount !== undefined ? p.commentCount + 1 : newComments.length
                    };
                }
                return p;
            });
            setPosts(update);
            setRecentPosts(update);
        });

        socket.on("comment:deleted", (data) => {
            const postId = data.postId || (data.post?._id || data.post);
            if (!postId) return;

            const update = (prev) => prev.map((p) => {
                if (p._id === postId) {
                    const existing = p.comments || [];
                    const filtered = existing.filter(c => (c._id || c) !== data._id);
                    return {
                        ...p,
                        comments: filtered,
                        commentCount: p.commentCount !== undefined ? Math.max(0, p.commentCount - 1) : filtered.length
                    };
                }
                return p;
            });
            setPosts(update);
            setRecentPosts(update);
        });

        socket.on("post:liked", (data) => {
            const postId = data._id || data.postId;
            const update = (prev) => prev.map((p) => {
                if (p._id === postId) {
                    const likes = data.likes || p.likes || [];
                    return { ...p, likes, likesCount: likes.length };
                }
                return p;
            });
            setPosts(update);
            setRecentPosts(update);
        });

        return () => {
            socket.off("post:new");
            socket.off("post:updated");
            socket.off("post:deleted");
            socket.off("comment:new");
            socket.off("comment:deleted");
            socket.off("post:liked");
        };
    }, []);

    const syncPostUpdate = (postId, updateData) => {
        const update = (prev) => prev.map((p) => {
            if (p._id === postId) {
                return { ...p, ...updateData };
            }
            return p;
        });
        setPosts(update);
        setRecentPosts(update);
    };

    return (
        <PostContext.Provider value={{ posts, recentPosts, loading, refreshPosts: loadPosts, syncPostUpdate }}>
            {children}
        </PostContext.Provider>
    );
};

export const usePosts = () => {
    const context = useContext(PostContext);
    if (!context) {
        throw new Error("usePosts must be used within a PostProvider");
    }
    return context;
};
