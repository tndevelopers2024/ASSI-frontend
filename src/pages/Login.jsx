import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/api";
import logo from "/images/assi_logo.png";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await API.post("/users/login", { email, password });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            navigate(from, { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                (err.request
                    ? "Cannot connect to server."
                    : "An unexpected error occurred.")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
            
            <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10 w-full max-w-md border border-white/40 animate-fadeIn">
                
                {/* LOGO */}
                <div className="flex justify-center mb-6">
                    <img
                        src={logo}
                        alt="ASSI"
                        className="w-32 drop-shadow-lg animate-float"
                    />
                </div>

                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Welcome Back
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="text-gray-700 text-sm font-medium">Email</label>
                        <input
                            type="email"
                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 text-sm font-medium">Password</label>
                        <input
                            type="password"
                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Logging in...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                {/* Optional Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    © {new Date().getFullYear()} ASSI — All Rights Reserved
                </p>

            </div>
        </div>
    );
}
