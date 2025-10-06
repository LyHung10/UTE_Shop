// features/user/components/UserSidebar.jsx
// Modern, clean sidebar inspired by Shopee/Lazada account menus
// TailwindCSS + react-router NavLink + lucide-react icons

import { NavLink } from "react-router-dom";
import {
    UserRound,
    Package,
    Bell,
    Heart,
    Ticket,
    ShieldCheck,
    LogOut,
} from "lucide-react";

const sections = [
    {
        title: "Tài khoản",
        items: [
            { label: "Tài khoản của tôi", to: "/user/profile", icon: UserRound },
            { label: "Yêu thích", to: "/user/product-favorites", icon: Heart },
        ],
    },
    {
        title: "Đơn hàng",
        items: [
            { label: "Đơn hàng của tôi", to: "/user/my-orders", icon: Package },
            { label: "Mã giảm giá", to: "/user/vouchers", icon: Ticket },
        ],
    },
    {
        title: "Bảo mật",
        items: [
            { label: "Thiết lập bảo mật", to: "/user/security", icon: ShieldCheck },
        ],
    },
];

const UserSidebar = () => {
    return (
        <aside className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
                    <div>
                        <p className="text-sm text-gray-500">Xin chào,</p>
                        <p className="text-sm font-semibold text-gray-900">User</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav
                aria-label="User navigation"
                className="max-h-[520px] overflow-y-auto px-2 py-3
                [ &::-webkit-scrollbar ]:w-1.5
                [ &::-webkit-scrollbar-thumb ]:bg-gray-300
                [ &::-webkit-scrollbar-thumb ]:rounded-full
                [ &::-webkit-scrollbar-track ]:bg-transparent"
            >
                {sections.map((section) => (
                    <div key={section.title} className="mb-3">
                        <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-gray-400">
                            {section.title}
                        </div>
                        <ul className="space-y-1 px-2">
                            {section.items.map(({ label, to, icon: Icon }) => (
                                <li key={to}>
                                    <NavLink
                                        to={to}
                                        end
                                        className={({ isActive }) =>
                                            [
                                                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
                                                isActive
                                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]"
                                                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-700",
                                            ].join(" ")
                                        }
                                    >
                                        <span className="relative">
                                          <Icon className="h-4.5 w-4.5" />
                                        </span>
                                        <span className="font-medium">{label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Bottom actions */}
                <div className="mt-2 border-t border-gray-100 pt-2 px-2">
                    <button
                        type="button"
                        className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-rose-700 transition"
                        onClick={() => {
                            // TODO: hook your sign-out logic here
                        }}
                    >
                        <LogOut className="h-4.5 w-4.5" />
                        <span className="font-medium">Đăng xuất</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
}
export default UserSidebar;