import { SidebarProvider, useSidebar } from "../context/SidebarContext.jsx";
import AppHeader from "./AppHeader.jsx";
import Backdrop from "./Backdrop.jsx";
import AppSidebar from "./AppSidebar.jsx";
import "../../../admin.css"
import {Outlet} from "react-router-dom";
import {ThemeProvider} from "@/admin/context/ThemeContext.jsx";
import {HelmetProvider} from "react-helmet-async";
const LayoutContent = () => {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();

    return (
        <div className="min-h-screen xl:flex">
            <div>
                <AppSidebar />
                <Backdrop />
            </div>
            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${
                    isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
                } ${isMobileOpen ? "ml-0" : ""}`}
            >
                <AppHeader />
                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 dark:bg-gray-900">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

const AppLayout = () => {
    return (
        <ThemeProvider>
            <SidebarProvider>
                <LayoutContent />
            </SidebarProvider>
        </ThemeProvider>
    );
};

export default AppLayout;
