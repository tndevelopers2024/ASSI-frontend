import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
    const token = localStorage.getItem("token");
    const location = useLocation();

    // If no token, redirect to login and save current location
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render child routes
    return <Outlet />;
}
