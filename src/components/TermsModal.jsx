import { X, ShieldCheck, UserCheck, FileText, BookOpen, AlertCircle, Scale, Megaphone, GraduationCap } from "lucide-react";

export default function TermsModal({ open, onClose }) {
    if (!open) return null;

    const terms = [
        {
            title: "Protect Privacy",
            content: "De-identify all data and images.",
            icon: <ShieldCheck className="text-blue-600" size={24} />,
        },
        {
            title: "Post Clearly",
            content: "Share: brief history, neuro status, key imaging, plan/question.",
            icon: <UserCheck className="text-green-600" size={24} />,
        },
        {
            title: "Be Professional",
            content: "Respectful tone; declare conflicts.",
            icon: <FileText className="text-purple-600" size={24} />,
        },
        {
            title: "Use Evidence",
            content: "Cite guidelines/literature where possible; label opinions.",
            icon: <BookOpen className="text-orange-600" size={24} />,
        },
        {
            title: "No Remote Treatment Orders",
            content: "Discuss options — don’t give direct medical advice.",
            icon: <AlertCircle className="text-red-600" size={24} />,
        },
        {
            title: "Stay Ethical",
            content: "No medico-legal details or restricted content.",
            icon: <Scale className="text-indigo-600" size={24} />,
        },
        {
            title: "No Promotions",
            content: "Avoid product or hospital marketing.",
            icon: <Megaphone className="text-pink-600" size={24} />,
        },
        {
            title: "Promote Learning",
            content: "Keep comments constructive and educational.",
            icon: <GraduationCap className="text-teal-600" size={24} />,
        },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-fadeIn p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scaleIn max-h-[85vh] flex flex-col">
                {/* HEADER */}
                <div className="flex justify-between items-center bg-[#F0F7FF] px-6 py-4 border-b border-blue-100">
                    <h2 className="text-xl font-bold text-[#1A3A7D]">Terms and Conditions</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black transition cursor-pointer p-1 hover:bg-white rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 overflow-y-auto hide-scrollbar space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {terms.map((term, index) => (
                            <div key={index} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                                <div className="mt-1 flex-shrink-0">{term.icon}</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">{index + 1}. {term.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{term.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-[#0057FF] hover:bg-blue-700 text-white font-semibold rounded-full transition shadow-md hover:shadow-lg cursor-pointer"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
}
