import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { FaWhatsapp, FaFacebookF, FaTelegramPlane } from "react-icons/fa";
import toast from "react-hot-toast";
import { FaXTwitter } from "react-icons/fa6";


const ShareModal = ({ isOpen, onClose, postUrl, postTitle }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const encodedUrl = encodeURIComponent(postUrl);
    const encodedTitle = encodeURIComponent(postTitle);

    const shareOptions = [
        {
            name: "WhatsApp",
            icon: <FaWhatsapp className="w-6 h-6" />,
            color: "bg-[#25D366]",
            url: `https://wa.me/?text=${encodedTitle}%0A%0A${encodedUrl}`,
        },
        {
            name: "Facebook",
            icon: <FaFacebookF className="w-6 h-6" />,
            color: "bg-[#1877F2]",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
        {
            name: "Twitter",
            icon: <FaXTwitter className="w-6 h-6" />,
            color: "bg-[#1DA1F2]",
            url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        },
        {
            name: "Telegram",
            icon: <FaTelegramPlane className="w-6 h-6" />,
            color: "bg-[#0088cc]",
            url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        },
    ];

    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Share Post</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {shareOptions.map((option) => (
                            <a
                                key={option.name}
                                href={option.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 group cursor-pointer"
                            >
                                <div className={`${option.color} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200`}>
                                    {option.icon}
                                </div>
                                <span className="text-xs font-medium text-gray-600">{option.name}</span>
                            </a>
                        ))}
                    </div>

                    {/* Copy Link Section */}
                    <div className="relative group">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl group-hover:border-gray-300 transition-colors">
                            <input
                                type="text"
                                value={postUrl}
                                readOnly
                                className="flex-1 bg-transparent text-sm text-gray-600 outline-none overflow-hidden text-ellipsis whitespace-nowrap"
                            />
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all shadow-sm cursor-pointer"
                            >
                                {copied ? (
                                    <>
                                        <Check size={16} className="text-green-600" />
                                        <span className="text-green-600 text-xs">Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={16} />
                                        <span className="text-xs">Copy</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 text-center">
                    <p className="text-xs text-gray-400">Share this post with your network</p>
                </div>
            </div>

            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
};

export default ShareModal;
