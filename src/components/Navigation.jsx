import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
    const location = useLocation();

    return (
        <nav className="bg-white shadow-md p-4">
            <div className="flex gap-6">
                <Link
                    to="/"
                    className={`px-4 py-2 rounded-lg transition-colors ${location.pathname === "/"
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                >
                    Home
                </Link>
                <Link
                    to="/profile"
                    className={`px-4 py-2 rounded-lg transition-colors ${location.pathname === "/profile"
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                >
                    Profile
                </Link>
            </div>
        </nav>
    );
}
