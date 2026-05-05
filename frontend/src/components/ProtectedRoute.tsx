import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../enums/routes";
import { useAuthStore } from "../store/authStore";

export function ProtectedRoute() {
  const location = useLocation();
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
