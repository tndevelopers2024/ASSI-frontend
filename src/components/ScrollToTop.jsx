import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll the main content area
        const mainContent = document.querySelector('.content-area');
        if (mainContent) {
            mainContent.scrollTo(0, 0);
        }

        // Fallback for window scroll
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
