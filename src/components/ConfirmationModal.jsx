import { AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    isDanger = true
}) {
    if (!isOpen) return null;

    const handleConfirm = async () => {
        try {
            const result = await onConfirm();   // get response from caller

            toast.success("Deleted successfully!", {
                duration: 2500,
            });
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete!", {
                duration: 2500,
            });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-[400px] p-6 relative animate-scaleIn border border-gray-100">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                    <X size={20} />
                </button>

                {/* Icon + Title */}
                <div className="flex flex-col items-center text-center">
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                            }`}
                    >
                        <AlertTriangle size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed px-4">{message}</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition cursor-pointer"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={async () => {
                            try {
                                await onConfirm();

                                // 🔥 SUCCESS TOAST HERE
                                toast.success("Deleted successfully!", {
                                    position: "top-center",
                                    style: {
                                        background: "#111",
                                        color: "#fff",
                                        borderRadius: "10px",
                                        padding: "10px 16px",
                                        fontWeight: "600",
                                    },
                                });

                            } catch (err) {
                                // ❌ ERROR TOAST HERE
                                toast.error("Failed to delete!", {
                                    position: "top-center",
                                    style: {
                                        background: "#dc2626",
                                        color: "#fff",
                                        borderRadius: "10px",
                                        padding: "10px 16px",
                                        fontWeight: "600",
                                    },
                                });
                            }

                            onClose();
                        }}
                        className={`flex-1 px-4 py-2.5 rounded-full text-white font-medium shadow-lg transition transform active:scale-95 cursor-pointer ${isDanger
                                ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                                : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                            }`}
                    >
                        {confirmText}
                    </button>

                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
                .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
}
