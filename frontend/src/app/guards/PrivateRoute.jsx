import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {useAuth} from "@/app/hooks/useAuth.jsx";

const PrivateRoute = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        toast.error("Bạn cần đăng nhập để sử dụng chức năng này!");
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <Outlet />;
};

export default PrivateRoute;
