import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../enums/routes";

export function ProtectedRoute() {
    const location = useLocation();

    // For now, we mock the auth state.
    // Later, this will come from a useAuth() hook or Redux/Zustand store.
    const isAuthenticated = true;

    if (!isAuthenticated) {
        // We pass the current location to 'state' so we can redirect the user
        // back to the page they were trying to access after they log in.
        return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
    }

    return <Outlet />;
}