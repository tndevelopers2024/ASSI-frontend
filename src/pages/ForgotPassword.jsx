import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import logo from "/images/assi_logo.png";
import toast from "react-hot-toast";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return toast.error("Invalid Email");
        }

        setLoading(true);

        try {
            const res = await API.post("/users/forgot-password", { email });
            toast.success(res.data.data || "OTP sent to your email!");
            // Navigate to Reset Password page, passing email
            navigate("/reset-password", { state: { email } });
        } catch (err) {
            toast.error(
                err.response?.data?.message || err.message || "Something went wrong"
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

                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                    Forgot Password
                </h1>
                <p className="text-center text-gray-500 mb-8 text-sm">
                    Enter your email to receive a password reset OTP.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                        <label className="text-gray-700 text-sm font-medium">Email</label>
                        <input
                            type="email"
                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                        {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition cursor-pointer"
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
