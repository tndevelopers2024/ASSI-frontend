import { useEffect, useState } from "react";
import CaseCard from "../components/CaseCard";
import { getSavedPosts } from "../api/postApi";

export default function SavedCases() {
    const [savedCases, setSavedCases] = useState([]);

    useEffect(() => {
        loadSavedPosts();
    }, []);

    const loadSavedPosts = async () => {
        try {
            const data = await getSavedPosts();
            setSavedCases(data);
        } catch (error) {
            console.error("Error fetching saved posts:", error);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="rounded-full bg-white px-4 py-2 w-fit mb-4 ml-4">
                        <h2 className="text-sm font-semibold">Saved Cases</h2>
                    </div>

            {savedCases.length === 0 ? (
                <div className="bg-white p-10 rounded-xl shadow text-center">
                    <div className="text-gray-400 mb-3">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Saved Cases Yet</h3>
                    <p className="text-gray-500">Cases you bookmark will appear here for easy access later.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {savedCases.map((caseData) => (
                        <CaseCard key={caseData._id} data={caseData} />
                    ))}
                </div>
            )}
        </div>
    );
}
