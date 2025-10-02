import React from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Search, ShoppingCart, User, MenuIcon, GraduationCap } from "lucide-react"
import { Menu, Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import { doLogout } from "@/redux/action/userAction.jsx"
import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { getCategories } from "@/services/categoryService.jsx"
import { fetchCart } from "@/redux/action/cartAction.jsx"
import NotificationBell from "./NotificationBell"
import {getCommunes} from "@/services/locationService.jsx";


export const cartRef = React.createRef()
const Header = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
    const user = useSelector((state) => state.user.account)
    const cartCount = useSelector((state) => state.cart.count)

    const handleLogOut = () => {
        dispatch(doLogout())
        navigate("/")
    }

    const [listCategories, setListCategories] = useState([])
    const fetchCategories = async () => {
        const location = await getCommunes();
        const data = await getCategories()
        if (data) {
            setListCategories(data)
        }
    }

    useEffect(() => {
        dispatch(fetchCart())
    }, [dispatch])

    useEffect(() => {
        fetchCategories()
    }, [])

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-blue-500/20">
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white text-center py-2 text-sm font-medium">
                🎓 Ưu đãi đặc biệt cho sinh viên - Giảm 25% đơn hàng đầu tiên!
                <button className="ml-2 underline hover:no-underline transition-all">Đăng ký ngay</button>
            </div>

            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 grid-pattern">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <motion.div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => navigate("/")}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg animate-glow">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white neon-text">UTE SHOP</h1>
                                <p className="text-xs text-blue-300">Đại học Sư phạm Kỹ thuật</p>
                            </div>
                        </motion.div>

                        <nav className="hidden md:flex items-center gap-6">
                            <Popover className="relative">
                                <PopoverButton className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:text-blue-300 transition-colors duration-200 rounded-lg hover:bg-white/10">
                                    <MenuIcon className="w-4 h-4" />
                                    Danh mục sản phẩm
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                </PopoverButton>

                                <PopoverPanel className="absolute top-full left-0 mt-2 w-96 glass rounded-xl shadow-2xl border border-blue-500/20 overflow-hidden">
                                    <div className="p-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            {listCategories && listCategories.length > 0 ? (
                                                listCategories.map((item) => (
                                                    <motion.button
                                                        key={item.id}
                                                        onClick={() => navigate(`category/${item.slug}`)}
                                                        className="text-left p-3 rounded-lg hover:bg-blue-500/20 text-white hover:text-blue-300 transition-all duration-200"
                                                        whileHover={{ scale: 1.02, x: 5 }}
                                                    >
                                                        <div className="font-medium">{item.name}</div>
                                                        <div className="text-xs text-blue-300 mt-1">Xem tất cả</div>
                                                    </motion.button>
                                                ))
                                            ) : (
                                                <span className="text-gray-400">Đang tải...</span>
                                            )}
                                        </div>
                                    </div>
                                </PopoverPanel>
                            </Popover>

                            <motion.button
                                className="px-4 py-2 text-sm font-medium text-white hover:text-orange-300 transition-colors duration-200 rounded-lg hover:bg-white/10"
                                whileHover={{ scale: 1.05 }}
                            >
                                Bộ sưu tập
                            </motion.button>

                            <motion.button
                                className="px-4 py-2 text-sm font-medium text-white hover:text-orange-300 transition-colors duration-200 rounded-lg hover:bg-white/10"
                                whileHover={{ scale: 1.05 }}
                            >
                                Về chúng tôi
                            </motion.button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 gap-3 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200">
                            <Search className="w-4 h-4 text-blue-300" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="bg-transparent text-white placeholder-blue-300 outline-none w-48 text-sm"
                            />
                        </div>

                        <motion.div
                            ref={cartRef}
                            className="relative cursor-pointer p-2 rounded-full hover:bg-white/10 transition-all duration-200"
                            onClick={() => navigate("/cart")}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ShoppingCart className="w-6 h-6 text-white hover:text-orange-300 transition-colors" />
                            {cartCount > 0 && (
                                <motion.span
                                    className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-glow"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </motion.div>
                        <div>
                            <NotificationBell />
                        </div>
                        {isAuthenticated === false ? (
                            <motion.button
                                onClick={() => navigate("/login")}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <User className="w-4 h-4" />
                                Đăng nhập
                            </motion.button>
                        ) : (
                            <Menu as="div" className="relative">
                                <Menu.Button className="flex items-center gap-2 p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                                    <User className="w-5 h-5" />
                                </Menu.Button>

                                <Menu.Items className="absolute right-0 mt-2 w-64 glass rounded-xl shadow-2xl border border-blue-500/20 overflow-hidden">
                                    <div className="p-2">
                                        <Menu.Item>
                                            <div className="px-4 py-3 border-b border-blue-500/20">
                                                <p className="text-sm text-white font-medium">{user?.email}</p>
                                                <p className="text-xs text-blue-300">Sinh viên UTE</p>
                                            </div>
                                        </Menu.Item>

                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => navigate("/user/profile")}
                                                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${active ? "bg-blue-500/20 text-blue-300" : "text-white"
                                                        }`}
                                                >
                                                    Tài khoản của tôi
                                                </button>
                                            )}
                                        </Menu.Item>

                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => navigate("/user/my-orders")}
                                                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${active ? "bg-blue-500/20 text-blue-300" : "text-white"
                                                        }`}
                                                >
                                                    Đơn hàng của tôi
                                                </button>
                                            )}
                                        </Menu.Item>

                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={handleLogOut}
                                                    className={`w-full text-left px-4 py-3 text-sm transition-colors border-t border-blue-500/20 ${active ? "bg-red-500/20 text-red-300" : "text-white"
                                                        }`}
                                                >
                                                    Đăng xuất
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Menu>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
