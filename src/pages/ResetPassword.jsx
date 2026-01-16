import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/api";
import logo from "/images/assi_logo.png";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get email passed from ForgotPassword page
    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Redirect if no email found
    useEffect(() => {
        if (!email) {
            toast.error("Please enter your email first.");
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);

        try {
            // Updated endpoint and payload for OTP verification
            const res = await API.put("/users/reset-password", {
                email,
                otp,
                password,
            });

            toast.success("Password reset successful! Please login.");
            navigate("/login");
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
                        className="w-60"
                    />
                </div>

                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                    Reset Password
                </h1>
                <p className="text-center text-gray-500 mb-8 text-sm">
                    Enter the OTP sent to <strong>{email}</strong> and your new password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* OTP Input */}
                    <div>
                        <label className="text-gray-700 text-sm font-medium">OTP Code</label>
                        <input
                            type="text"
                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition tracking-widest text-center text-lg font-bold"
                            placeholder="SAMPLE"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-gray-700 text-sm font-medium">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition pr-10"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-[calc(50%-2px)] text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-700 text-sm font-medium">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition pr-10"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-[calc(50%-2px)] text-gray-500 hover:text-gray-700"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
