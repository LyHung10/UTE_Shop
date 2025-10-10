import { useContext } from "react";

import {PermissionContext} from "@/app/contexts/PermissionContext.jsx";

export const usePermission = () => useContext(PermissionContext);
