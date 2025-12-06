import { Bell, Search, ChevronDown, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import API from "../api/api";  // ✅ MISSING IMPORT (required)
import UploadCaseModal from "../components/UploadCaseModal";
import ProfileDropdown from "../components/ProfileDropdown";
import EditProfileImageModal from "../components/EditProfileImageModal";

import { useSearch } from "../context/SearchContext";

export default function Topbar() {
  const [openModal, setOpenModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [editImageOpen, setEditImageOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { searchQuery, setSearchQuery } = useSearch();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const res = await API.get("/notifications/unread-count");
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Unread count error:", err);
    }
  };
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);


  const dropdownRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userLetter = user?.fullname?.charAt(0)?.toUpperCase() || "?";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Upload profile picture
  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("profile", file);

      const res = await API.put("/users/update-profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update stored user
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.reload();
    } catch (err) {
      console.error("Profile upload error:", err);
    }
  };

  return (
    <div className="w-full bg-white border-b border-[#E5E7EB] px-6 py-3 flex items-center justify-between shadow-sm">

      {/* Search Bar */}
      <div className="w-1/3 max-md:w-1/2">
        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full">
          <Search size={16} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent w-full outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-full max-md:py-3 max-md:px-3 text-sm hover:bg-blue-700 cursor-pointer flex items-center gap-2"
        >
          <p className="max-md:hidden">Add Your Case</p> <Plus size={16} />
        </button>

        <div className="relative cursor-pointer" onClick={() => window.location.href = "/notifications"}>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Bell size={18} />
          </div>

          {/* 🔥 Notification Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
              {unreadCount}
            </span>
          )}
        </div>


        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setOpenDropdown((prev) => !prev)}
          >
            <div className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center overflow-hidden text-white font-semibold text-lg">
              {user?.profile_url ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/${user.profile_url?.replace(/^\//, "")}`}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />


              ) : (
                userLetter
              )}
            </div>

            <span className="text-sm font-medium max-md:hidden">{user?.fullname}</span>
            <ChevronDown size={16} />
          </div>

          {openDropdown && (
            <ProfileDropdown
              onLogout={handleLogout}
              onEditImage={() => setEditImageOpen(true)}
              user={user}
            />
          )}
        </div>
      </div>

      <UploadCaseModal open={openModal} onClose={() => setOpenModal(false)} />

      <EditProfileImageModal
        open={editImageOpen}
        onClose={() => setEditImageOpen(false)}
        onUpload={handleImageUpload}
      />
    </div>
  );
}
