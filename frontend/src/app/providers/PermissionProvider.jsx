import { useSelector } from "react-redux";
import {PermissionContext} from "@/app/contexts/PermissionContext.jsx";

const PermissionProvider = ({ children }) => {
    const isPermission = useSelector((state) => state.authStatus.role);

    return (
        <PermissionContext.Provider value={{ isPermission }}>
            {children}
        </PermissionContext.Provider>
    );
};

export default PermissionProvider;
