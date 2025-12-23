import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    return (
        <div className="min-h-screen">
            <div className="">
                <div className="rounded-full bg-white px-4 py-2 w-fit mb-4 ml-4">
                    <h2 className="text-sm font-semibold">Settings</h2>
                </div>

                {/* ACCOUNT INFO (view-only) */}
                <div className="bg-white rounded-2xl shadow p-8 space-y-10">

                    <div>
                        <h3 className="text-xl font-semibold mb-6">Account Information</h3>

                        <div className="space-y-5">

                            {/* NAME */}
                            <div>
                                <label className="text-sm text-gray-500">Name</label>
                                <div className="mt-1 p-3 w-full border rounded-xl bg-gray-50 text-gray-700">
                                    {user?.fullname || "Doctor"}
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="text-sm text-gray-500">Email</label>
                                <div className="mt-1 p-3 w-full border rounded-xl bg-gray-50 text-gray-700">
                                    {user?.email || "doctor@assi.com"}
                                </div>
                            </div>

                            {/* ASSI ID */}
                            <div>
                                <label className="text-sm text-gray-500">ASSI ID</label>
                                <div className="mt-1 p-3 w-full border rounded-xl bg-gray-50 text-gray-700">
                                    {user?.user_id || "ASSI-ID"}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
