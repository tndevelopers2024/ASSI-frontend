import { LogOut, User, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown({ onLogout, onEditImage, user }) {
  const navigate = useNavigate();
  return (
    <div className="absolute right-0 mt-3 w-64 rounded-2xl shadow-xl overflow-hidden z-50 animate-fadeIn">

      {/* BLUE TOP SECTION WITH AVATAR */}
      <div className="bg-blue-600 p-5 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md flex items-center justify-center bg-gray-200">
          {user?.profile_url ? (
            <img
              src={`${import.meta.env.VITE_API_URL}/${user.profile_url}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-gray-500">
              {user?.fullname?.charAt(0)?.toUpperCase() || "?"}
            </span>
          )}
        </div>

        <h3 className="mt-3 text-white font-semibold text-lg text-center">
          {user?.fullname || "User Name"}
        </h3>
        <p className="text-blue-100 text-sm">
          {user?.email || "email@example.com"}
        </p>
      </div>

      {/* WHITE CONTENT AREA */}
      <div className="bg-white p-3 space-y-2">

        {/* Edit Picture */}
        <button
          onClick={onEditImage}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm text-gray-700 cursor-pointer"
        >
          <ImageIcon size={18} className="text-blue-600" />
          Edit Profile Picture
        </button>

        {/* My Profile */}
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm text-gray-700 cursor-pointer"
        >
          <User size={18} className="text-purple-600" />
          My Profile
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition text-sm text-red-600 cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>
    </div>
  );
}
