import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Bookmark, User, Settings, LogOut } from "lucide-react";
import logo from "/images/assi_logo.png";

export default function Sidebar() {
    const navigate = useNavigate();

    const menu = [
        { label: "Home", icon: <LayoutDashboard size={18} />, path: "/" },        
        { label: "Saved Cases", icon: <Bookmark size={18} />, path: "/saved" },
        { label: "Profile", icon: <User size={18} />, path: "/profile" },
        { label: "Settings", icon: <Settings size={18} />, path: "/settings" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <div className="w-full h-full bg-white border-r border-gray-200 p-5 flex flex-col max-md:hidden">
      <img src={logo} className="mb-8 w-200" alt="" />



            <ul className="space-y-4 flex-1">
                {menu.map((m, i) => (
                    <NavLink
                        key={i}
                        to={m.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 cursor-pointer p-2 rounded-lg
               ${isActive ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700"}
               hover:text-blue-600`
                        }
                    >
                        {m.icon}
                        <span>{m.label}</span>
                    </NavLink>
                ))}
            </ul>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-2 rounded-lg text-red-600 hover:bg-red-50 transition mt-4"
            >
                <LogOut size={18} />
                <span>Logout</span>
            </button>
        </div>
    );
}
