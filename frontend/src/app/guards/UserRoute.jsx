import { Navigate, Outlet, useLocation } from "react-router-dom";
import {usePermission} from "@/app/hooks/usePermission.jsx";


const UserRoute = () => {
    const { isPermission } = usePermission();
    const location = useLocation();

    if (isPermission !== "admin") {
        return <Outlet />;
    }
    return <Navigate to="/admin" replace state={{ from: location }} />
};

export default UserRoute;
