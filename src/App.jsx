import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import RightSidebar from "./components/RightSidebar";
import BottomNav from "./components/BottomNav";   // ⬅️ Add this
import { SearchProvider } from "./context/SearchContext";
import { ModalProvider } from "./context/ModalContext";
import { PostProvider } from "./context/PostContext";
import ScrollToTop from "./components/ScrollToTop";


export default function App() {
  return (
    <SearchProvider>
      <ModalProvider>
        <PostProvider>


          <div className="app-grid h-screen w-full overflow-hidden">
            <ScrollToTop />
            {/* LEFT SIDEBAR */}
            <Sidebar />

            {/* TOPBAR */}
            <Topbar />

            {/* MAIN CONTENT */}
            <main className="grid grid-cols-[2fr_1fr] max-md:grid-cols-[1fr] content-area overflow-y-auto bg-[#F5F7FA] p-6 max-md:py-2 max-md:overflow-x-hidden">
              <div>
                <Outlet />
              </div>

              {/* RIGHT SIDEBAR */}
              <div className="max-md:hidden">
                <RightSidebar />
              </div>
            </main>

            {/* ✅ MOBILE BOTTOM NAV */}
            <BottomNav />   {/* ⬅️ Place it here */}

          </div>
        </PostProvider>
      </ModalProvider>
    </SearchProvider>
  );
}
