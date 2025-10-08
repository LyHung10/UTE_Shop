import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {useAuth} from "@/app/hooks/useAuth.jsx";

const PrivateRoute = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <Outlet />;
};

export default PrivateRoute;
