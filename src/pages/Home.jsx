import { useEffect, useState, useRef, useCallback } from "react";
import CaseCard from "../components/CaseCard";
import UploadCaseModal from "../components/UploadCaseModal";
import { SlidersHorizontal, X as XIcon } from "lucide-react"; // Filter icon
import { usePosts } from "../context/PostContext";
import { PostSkeleton } from "../components/Skeleton";

import { useSearch } from "../context/SearchContext";

export default function Home() {
    const { posts, loading } = usePosts();
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [filtersApplied, setFiltersApplied] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    // Selected categories
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortBy, setSortBy] = useState("recent");
    const { searchQuery } = useSearch();

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(5);
    const observer = useRef();

    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && visibleCount < filteredPosts.length) {
                setVisibleCount(prev => prev + 5);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, filteredPosts.length, visibleCount]);

    useEffect(() => {
        filterPosts();
        setVisibleCount(5); // Reset count on filter/search change
    }, [searchQuery, selectedCategories, sortBy, posts]);


    const filterPosts = () => {
        let result = [...posts];

        // 1. Filter by Category
        if (selectedCategories.length > 0) {
            result = result.filter(post => selectedCategories.includes(post.category));
        }

        // 2. Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(post =>
                post.title?.toLowerCase().includes(query) ||
                post.content?.toLowerCase().includes(query) ||
                post.user?.fullname?.toLowerCase().includes(query)
            );
        }

        // 3. Sort
        if (sortBy === "recent") {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === "popular") {
            result.sort((a, b) => {
                const aPop = (a.likes?.length || 0) + (a.comments?.length || 0);
                const bPop = (b.likes?.length || 0) + (b.comments?.length || 0);
                return bPop - aPop;
            });
        } else if (sortBy === "random") {
            result.sort(() => Math.random() - 0.5);
        }

        setFilteredPosts(result);
        setFiltersApplied(selectedCategories.length > 0 || !!searchQuery || sortBy !== "recent");
    };

    const categories = [
        "General",
        "Education",
        "Coding",
        "Design",
        "News",
        "Technology",
        "Entertainment",
        "Other",
    ];

    return (
        <div className="min-h-screen">
            <div className="">

                {/* 🔥 Top Header Row */}
                <div className="flex items-center justify-between mb-5 max-md:px-4">
                    <div className="rounded-full bg-white px-4 py-2">
                        <h2 className="text-sm font-semibold">Recent Cases</h2>
                    </div>

                    {/* FILTER BUTTON */}
                    <button
                        className="relative flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow border hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => setFilterOpen(true)}
                    >
                        <SlidersHorizontal size={18} />

                        <span>Filter</span>

                        {/* Blue Dot Indicator */}
                        {filtersApplied && (
                            <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                    </button>
                </div>

                {/* POSTS */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((n) => <PostSkeleton key={n} />)}
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
                        No cases available yet.
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredPosts.slice(0, visibleCount).map((post, index) => {
                            const isLastElement = filteredPosts.slice(0, visibleCount).length === index + 1;
                            return (
                                <div key={post._id} ref={isLastElement ? lastPostElementRef : null}>
                                    <CaseCard
                                        data={post}
                                        onUpdate={(postToEdit) => {
                                            setEditingPost(postToEdit);
                                            setUploadModalOpen(true);
                                        }}
                                        onDelete={() => filterPosts()}
                                    />
                                </div>
                            );
                        })}

                        {/* Loading more skeleton */}
                        {visibleCount < filteredPosts.length && (
                            <div className="mt-4">
                                <PostSkeleton />
                            </div>
                        )}
                    </div>
                )}
            </div>
            {filterOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 h-full">
                    <div className="bg-white w-[450px] rounded-2xl shadow-xl p-6 relative animate-fadeIn">

                        {/* Close Button */}
                        <button
                            className="absolute right-4 top-4 text-gray-600 hover:text-black cursor-pointer"
                            onClick={() => setFilterOpen(false)}
                        >
                            <XIcon size={24} />
                        </button>

                        <h2 className="text-xl font-semibold text-center mb-6">
                            Filter & Sort
                        </h2>

                        {/* SORT BY SECTION */}
                        <p className="text-sm font-semibold text-[#1A3A7D] mb-3">Sort By</p>
                        <div className="flex gap-2 mb-8">
                            <button
                                onClick={() => setSortBy("recent")}
                                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${sortBy === "recent"
                                    ? "bg-blue-600 text-white shadow-md transform scale-105"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                Recent
                            </button>
                            <button
                                onClick={() => setSortBy("popular")}
                                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${sortBy === "popular"
                                    ? "bg-blue-600 text-white shadow-md transform scale-105"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                Popular
                            </button>
                            <button
                                onClick={() => setSortBy("random")}
                                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${sortBy === "random"
                                    ? "bg-blue-600 text-white shadow-md transform scale-105"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                Random
                            </button>
                        </div>

                        <p className="text-sm font-semibold text-[#1A3A7D] mb-3">Categories</p>

                        {/* CATEGORY CHECKBOXES */}
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map((cat) => (
                                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat)}
                                        onChange={() => {
                                            if (selectedCategories.includes(cat)) {
                                                setSelectedCategories(selectedCategories.filter((c) => c !== cat));
                                            } else {
                                                setSelectedCategories([...selectedCategories, cat]);
                                            }
                                        }}
                                    />
                                    <span className="text-gray-700">{cat}</span>
                                </label>
                            ))}
                        </div>

                        {/* BUTTONS */}
                        <div className="flex justify-between mt-8">

                            <button
                                className="px-5 py-2 rounded-full border hover:bg-gray-100 cursor-pointer text-sm font-medium"
                                onClick={() => {
                                    setSelectedCategories([]);
                                    setSortBy("recent");
                                }}
                            >
                                Reset Filters
                            </button>

                            <button
                                className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                onClick={() => setFilterOpen(false)}
                            >
                                Apply Filters
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* Upload/Edit Modal */}
            <UploadCaseModal
                open={uploadModalOpen}
                onClose={() => {
                    setUploadModalOpen(false);
                    setEditingPost(null);
                }}
                initialData={editingPost}
            />

        </div>
    );
}
