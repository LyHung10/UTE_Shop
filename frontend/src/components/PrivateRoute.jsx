import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";

const PrivateRoute = () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        toast.error("Bạn cần đăng nhập để sử dụng chức năng này!");
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
