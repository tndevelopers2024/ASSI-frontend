import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllPosts } from "../api/postApi";
import { io } from "socket.io-client";

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
            // 1. Shuffled list for Home feed (shuffles ONLY on initial load/hard refresh)
            const shuffled = shuffleArray(data);
            setPosts(shuffled);

            // 2. Chronological list for Sidebar (always newest first)
            const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRecentPosts(sorted);
        } catch (error) {
            console.error("Error loading posts in context:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();

        const socket = io(import.meta.env.VITE_API_URL);

        socket.on("post:new", (post) => {
            // New posts siempre go to the top
            setPosts((prev) => [post, ...prev]);
            setRecentPosts((prev) => [post, ...prev]);
        });

        socket.on("post:updated", (updated) => {
            setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
            setRecentPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
        });

        return () => {
            socket.off("post:new");
            socket.off("post:updated");
            socket.disconnect();
        };
    }, []);

    return (
        <PostContext.Provider value={{ posts, recentPosts, loading, refreshPosts: loadPosts }}>
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
