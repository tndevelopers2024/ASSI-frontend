import { useEffect, useState } from "react";
import { getAllPosts } from "../api/postApi";
import CaseCard from "../components/CaseCard";
import UploadCaseModal from "../components/UploadCaseModal";
import { SlidersHorizontal, X as XIcon } from "lucide-react"; // Filter icon

import { useSearch } from "../context/SearchContext";

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [filtersApplied, setFiltersApplied] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    // Selected categories
    const [selectedCategories, setSelectedCategories] = useState([]);
    const { searchQuery } = useSearch();

    const shuffleArray = (array) => {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    };

    useEffect(() => {
        loadPosts();
    }, []);

    useEffect(() => {
        filterPosts();
    }, [searchQuery, selectedCategories, posts]);

    const loadPosts = async () => {
    try {
        const data = await getAllPosts();

        // Shuffle posts randomly
        const shuffled = shuffleArray(data);

        setPosts(shuffled);
        setFilteredPosts(shuffled);
    } catch (error) {
        console.error("Error loading posts:", error);
    }
};


    const filterPosts = () => {
        let result = posts;

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

        setFilteredPosts(result);
        setFiltersApplied(selectedCategories.length > 0 || !!searchQuery);
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
                <div className="flex items-center justify-between mb-5">
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
                {filteredPosts.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
                        No cases available yet.
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredPosts.map((post) => (
                            <CaseCard
                                key={post._id}
                                data={post}
                                onUpdate={(postToEdit) => {
                                    setEditingPost(postToEdit);
                                    setUploadModalOpen(true);
                                }}
                            />
                        ))}
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

                        <h2 className="text-xl font-semibold text-center mb-4">
                            Filter Cases
                        </h2>

                        <p className="text-sm font-semibold text-[#1A3A7D] mb-2">Categories</p>

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
                                className="px-5 py-2 rounded-full border hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    setSelectedCategories([]);
                                    // Filter will automatically update due to useEffect
                                }}
                            >
                                Reset
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
