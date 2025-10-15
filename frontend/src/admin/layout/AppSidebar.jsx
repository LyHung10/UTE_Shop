import { useCallback, useEffect, useRef, useState } from "react";

// Assume these icons are imported from an icon library
import {
  AlertIcon,
  CalenderIcon, ChatIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots, PaperPlaneIcon,
  UserCircleIcon, UserIcon,
  SendNotificationIcon,
} from "../icons/index.js";
import { useSidebar } from "../context/SidebarContext.jsx";
import { Link, useLocation } from "react-router-dom";
import { BoxIcon, Package, User2Icon, FolderTree, TicketPercent } from "lucide-react";
import { Zap, Flame, TrendingUp, Clock, Bolt } from "lucide-react";
import { getCheckHasNewOrders } from "@/services/adminService.jsx";

const navItems = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/admin",
  },
  {
    icon: <ChatIcon />,
    name: "Chat",
    path: "/admin/chat",
  },
  {
    icon: <PaperPlaneIcon />,
    name: "Notifications",
    path: "/admin/notification",
  },
];

const othersItems = [
  {
    icon: <User2Icon />,
    name: "Customer",
    path: "/admin/manage-customers",
  },
  {
    icon: <Flame />,
    name: "Flash Sales",
    path: "/admin/manage-flashsales",
  },
  {
    icon: <Package />,
    name: "Orders",
    path: "/admin/manage-orders",
  },
  {
    icon: <FolderTree />,
    name: "Categories",
    path: "/admin/manage-categories",
  },
  {
    icon: <BoxIcon />,
    name: "Products",
    path: "/admin/manage-products",
  },
  {
    icon: <TicketPercent />,
    name: "Vouchers",
    path: "/admin/manage-vouchers",
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});
  const [hasNewOrder, setHasNewOrder] = useState(false);

  const isActive = useCallback(
      (path) => location.pathname === path,
      [location.pathname]
  );

  // ✅ Sửa đọc axios response: dùng res.data
  useEffect(() => {
    const fetchHasNew = async () => {
      try {
        const res = await getCheckHasNewOrders();
        const success = res?.success ?? true; // nếu backend không trả success, coi như true
        const flag = res?.hasNewOrder ?? false;
        if (success) setHasNewOrder(!!flag);
      } catch (e) {
        setHasNewOrder(false); // im lặng nếu lỗi, không hiển thị huy hiệu
      }
    };
    fetchHasNew();
  }, []);

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
          prevOpenSubmenu &&
          prevOpenSubmenu.type === menuType &&
          prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items, menuType) => (
      <ul className="flex flex-col gap-4">
        {items.map((nav, index) => (
            <li key={nav.name}>
              {nav.subItems ? (
                  <button
                      onClick={() => handleSubmenuToggle(index, menuType)}
                      className={`menu-item group ${
                          openSubmenu?.type === menuType && openSubmenu?.index === index
                              ? "menu-item-active"
                              : "menu-item-inactive"
                      } cursor-pointer ${
                          !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                      }`}
                  >
              <span
                  className={`menu-item-icon-size  ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="menu-item-text flex items-center gap-2">
                  {nav.name}
                          {/* (Tùy chọn) Nếu sau này Orders có submenu, vẫn có thể hiện badge ở đây */}
                          {nav.name === "Orders" && hasNewOrder && (
                              <span className="px-1.5 py-0.5 text-[10px] leading-none rounded-full bg-rose-600 text-white animate-pulse">
                      NEW
                    </span>
                          )}
                </span>
                    )}
                    {(isExpanded || isHovered || isMobileOpen) && (
                        <ChevronDownIcon
                            className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                openSubmenu?.type === menuType && openSubmenu?.index === index
                                    ? "rotate-180 text-brand-500"
                                    : ""
                            }`}
                        />
                    )}
                  </button>
              ) : (
                  nav.path && (
                      <Link
                          to={nav.path}
                          className={`menu-item group ${
                              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                          }`}
                      >
                <span
                    className={`menu-item-icon-size ${
                        isActive(nav.path)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                            // ✅ Gắn badge "NEW" cạnh chữ Orders tại nhánh Link (đúng nơi render)
                            <span className="menu-item-text flex items-center gap-2">
                    {nav.name}
                              {nav.name === "Orders" && hasNewOrder && (
                                  <span className="px-1.5 py-0.5 text-[10px] leading-none rounded-full bg-rose-400 text-white animate-pulse">
                        NEW
                      </span>
                              )}
                  </span>
                        )}
                      </Link>
                  )
              )}
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                  <div
                      ref={(el) => {
                        subMenuRefs.current[`${menuType}-${index}`] = el;
                      }}
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        height:
                            openSubmenu?.type === menuType && openSubmenu?.index === index
                                ? `${subMenuHeight[`${menuType}-${index}`]}px`
                                : "0px",
                      }}
                  >
                    <ul className="mt-2 space-y-1 ml-9">
                      {nav.subItems.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                                to={subItem.path}
                                className={`menu-dropdown-item ${
                                    isActive(subItem.path)
                                        ? "menu-dropdown-item-active"
                                        : "menu-dropdown-item-inactive"
                                }`}
                            >
                              {subItem.name}
                              <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                            <span
                                className={`ml-auto ${
                                    isActive(subItem.path)
                                        ? "menu-dropdown-badge-active"
                                        : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                            >
                            new
                          </span>
                        )}
                                {subItem.pro && (
                                    <span
                                        className={`ml-auto ${
                                            isActive(subItem.path)
                                                ? "menu-dropdown-badge-active"
                                                : "menu-dropdown-badge-inactive"
                                        } menu-dropdown-badge`}
                                    >
                            pro
                          </span>
                                )}
                      </span>
                            </Link>
                          </li>
                      ))}
                    </ul>
                  </div>
              )}
            </li>
        ))}
      </ul>
  );

  return (
      <aside
          className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
              isExpanded || isMobileOpen
                  ? "w-[290px]"
                  : isHovered
                      ? "w-[290px]"
                      : "w-[90px]"
          }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
          onMouseEnter={() => !isExpanded && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
      >
        <div
            className={`py-8 flex ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
            }`}
        >
          <Link to="/admin">
            {isExpanded || isHovered || isMobileOpen ? (
                <>
                  <img
                      className="dark:hidden"
                      src="/images/logo/logo.svg"
                      alt="Logo"
                      width={150}
                      height={40}
                  />
                  <img
                      className="hidden dark:block"
                      src="/images/logo/logo-dark.svg"
                      alt="Logo"
                      width={150}
                      height={40}
                  />
                </>
            ) : (
                <img
                    src="/images/logo/logo-icon.svg"
                    alt="Logo"
                    width={32}
                    height={32}
                />
            )}
          </Link>
        </div>
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                        !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                      "Menu"
                  ) : (
                      <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(navItems, "main")}
              </div>
              <div className="">
                <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                        !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                      "Manage"
                  ) : (
                      <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            </div>
          </nav>
        </div>
      </aside>
  );
};

export default AppSidebar;
