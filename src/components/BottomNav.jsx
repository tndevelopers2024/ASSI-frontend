// components/BottomNav.jsx
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Bookmark, User, Settings } from "lucide-react";

export default function BottomNav() {
  const menu = [
    { label: "Home", icon: <LayoutDashboard size={20} />, path: "/" },
    { label: "Saved", icon: <Bookmark size={20} />, path: "/saved" },
    { label: "Profile", icon: <User size={20} />, path: "/profile" },
    { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md py-2 z-50 md:hidden">
      <div className="flex items-center justify-around">
        {menu.map((m, i) => (
          <NavLink
            key={i}
            to={m.path}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs
              ${isActive ? "text-blue-600 font-semibold" : "text-gray-600"}`
            }
          >
            {m.icon}
            <span className="mt-1">{m.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
