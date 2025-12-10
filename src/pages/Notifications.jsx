import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await API.get("/notifications");

            // ⛔ FILTER OUT deleted posts/comments
            const filtered = res.data.filter(
                (n) => n.post?._id && n.comment?._id
            );

            setNotifications(filtered);

            await API.put("/notifications/mark-read");
        } catch (err) {
            console.error("Error loading notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5">
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-[#1A3A7D] mb-5">
                    Notifications
                </h2>

                {/* 🔹 Skeleton Loader */}
                {loading && (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 p-4 rounded-xl border border-gray-200"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-300"></div>

                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                                    <div className="h-3 bg-gray-300 rounded w-52"></div>
                                    <div className="h-2 bg-gray-200 rounded w-24"></div>
                                </div>

                                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 🔹 Empty State */}
                {!loading && notifications.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                        No notifications yet.
                    </p>
                )}

                {/* 🔹 Notifications List */}
                {!loading && (
                    <div className="space-y-4">
                        {notifications.map((n) => (
                            <div
                                key={n._id}
                                onClick={async () => {
                                    // Mark only this notification as read
                                    await API.put(`/notifications/mark-one-read/${n._id}`);

                                    navigate(`/post/${n.post._id}?comment=${n.comment._id}`);
                                }}
                                className={`flex items-start gap-4 p-4 rounded-xl border 
                                ${n.isRead ? "bg-white" : "bg-blue-50 border-blue-200"} 
                                hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer`}
                            >
                                {/* Profile Image */}
                                <div className="w-10 h-10 rounded-full bg-gray-200 shadow flex items-center justify-center overflow-hidden">
                                    {n.fromUser?.profile_url ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/${n.fromUser.profile_url}`}
                                            alt="User"
                                            className="w-full h-full object-cover"
                                            onError={(e) => (e.target.style.display = "none")}
                                        />
                                    ) : (
                                        <span className="text-gray-700 font-semibold text-lg">
                                            {n.fromUser?.fullname?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Notification Content */}
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {n.fromUser?.fullname}
                                    </p>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {n.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
