import { Navigate, Outlet, useLocation } from "react-router-dom";
import {usePermission} from "@/app/hooks/usePermission.jsx";


const AdminRoute = () => {
    const { isPermission } = usePermission();
    const location = useLocation();

    if (isPermission !== "admin") {
        return <Navigate to="/" replace state={{ from: location }} />;
    }
    return <Outlet />;
};

export default AdminRoute;
