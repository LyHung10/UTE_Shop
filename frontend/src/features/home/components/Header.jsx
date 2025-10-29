import React from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Search, ShoppingCart, User, MenuIcon, GraduationCap, X, Clock, TrendingUp } from "lucide-react"
import { Menu, Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import { doLogout } from "@/redux/action/authAction.jsx"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { getCategories } from "@/services/categoryService.jsx"
import { fetchCart } from "@/redux/action/cartAction.jsx"
import { getSearchSuggestions } from "@/services/searchService.jsx"
import NotificationBell from "./NotificationBell"

export const cartRef = React.createRef()
const Header = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const isAuthenticated = useSelector((state) => state.authStatus.isAuthenticated)
    const user = useSelector((state) => state.user)
    const cartCount = useSelector((state) => state.cart.count)

    // Search states
    const [searchQuery, setSearchQuery] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [searchHistory, setSearchHistory] = useState([])
    const [isSearching, setIsSearching] = useState(false)

    const searchInputRef = useRef(null)
    const searchContainerRef = useRef(null)

    const handleLogOut = () => {
        dispatch(doLogout())
        navigate("/")
    }

    const [listCategories, setListCategories] = useState([])
    const fetchCategories = async () => {
        const data = await getCategories()
        if (data) {
            setListCategories(data)
        }
    }

    // Load search history
    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
        setSearchHistory(history)
    }, [])

    useEffect(() => {
        dispatch(fetchCart())
    }, [dispatch])

    useEffect(() => {
        fetchCategories()
    }, [])

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Debounced search suggestions
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSuggestions([])
            return
        }

        const timer = setTimeout(async () => {
            setIsSearching(true)
            try {
                const data = await getSearchSuggestions(searchQuery)
                if (data && data.success) {
                    setSuggestions(data.suggestions || [])
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error)
                setSuggestions([])
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Handle search submission
    const handleSearch = (query = searchQuery) => {
        if (!query.trim()) return

        // Add to search history
        const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5)
        setSearchHistory(newHistory)
        localStorage.setItem('searchHistory', JSON.stringify(newHistory))

        // Navigate to search results page
        navigate(`/search?q=${encodeURIComponent(query)}`)

        // Reset states
        setSearchQuery("")
        setShowSuggestions(false)
        setSuggestions([])
    }

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        handleSearch(suggestion.name)
    }

    // Handle history click
    const handleHistoryClick = (historyItem) => {
        setSearchQuery(historyItem)
        handleSearch(historyItem)
    }

    // Clear search history
    const clearSearchHistory = () => {
        setSearchHistory([])
        localStorage.setItem('searchHistory', '[]')
    }

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    // Clear search input
    const clearSearch = () => {
        setSearchQuery("")
        setSuggestions([])
        searchInputRef.current?.focus()
    }

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
                                <PopoverButton className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white hover:text-blue-300 transition-colors duration-200 rounded-lg hover:bg-white/10 font-sans">                                    <MenuIcon className="w-4 h-4" />
                                    DANH MỤC SẢN PHẨM
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                </PopoverButton>

                                <PopoverPanel className="absolute top-full left-0 mt-2 w-150 glass rounded-xl shadow-2xl border border-blue-500/20 overflow-hidden">
                                    <div className="p-6">
                                        <div className="grid grid-cols-3 gap-4">
                                            <motion.button
                                                onClick={() => navigate(`category/qua-luu-niem`)}
                                                className="text-left p-3 rounded-lg hover:bg-blue-500/20 text-white hover:text-blue-300 transition-all duration-200"
                                                whileHover={{ scale: 1.02, x: 5 }}
                                            >
                                                <div className="font-medium">Quà lưu niệm</div>
                                                <div className="text-xs text-blue-300 mt-1">Xem tất cả</div>
                                            </motion.button>

                                            <motion.button
                                                onClick={() => navigate(`category/van-phong-pham`)}
                                                className="text-left p-3 rounded-lg hover:bg-blue-500/20 text-white hover:text-blue-300 transition-all duration-200"
                                                whileHover={{ scale: 1.02, x: 5 }}
                                            >
                                                <div className="font-medium">Văn phòng phẩm</div>
                                                <div className="text-xs text-blue-300 mt-1">Xem tất cả</div>
                                            </motion.button>

                                            <motion.button
                                                onClick={() => navigate(`category/thoi-trang-ute`)}
                                                className="text-left p-3 rounded-lg hover:bg-blue-500/20 text-white hover:text-blue-300 transition-all duration-200"
                                                whileHover={{ scale: 1.02, x: 5 }}
                                            >
                                                <div className="font-medium">Thời trang UTE</div>
                                                <div className="text-xs text-blue-300 mt-1">Xem tất cả</div>
                                            </motion.button>
                                        </div>
                                    </div>
                                </PopoverPanel>
                            </Popover>

                            <Popover className="relative">
                                <PopoverButton className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white hover:text-blue-300 transition-colors duration-200 rounded-lg hover:bg-white/10 font-sans">                                      THỜI TRANG KHÁC
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                                </PopoverButton>

                                <PopoverPanel
                                    className="top-full fixed left-1/2 -translate-x-1/2 w-[1000px] max-w-[90vw]
                                    glass rounded-2xl shadow-2xl border border-blue-500/20 overflow-hidden z-[60]"
                                >
                                    <div className="relative bg-slate-900/60">
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-8 p-6">
                                            {/* Cột ảnh nổi bật (giống style mega menu) */}
                                            <div className="col-start-2 grid grid-cols-2 gap-4">
                                                <div className="group relative text-sm">
                                                    <img
                                                        src="https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-01.jpg"
                                                        alt="Bộ sưu tập mới"
                                                        className="aspect-square w-full rounded-lg object-cover bg-slate-700 group-hover:opacity-80 transition"
                                                    />
                                                    <button
                                                        onClick={() => navigate('/category/all')}
                                                        className="mt-3 block font-medium text-white group-hover:text-blue-300 transition"
                                                    >
                                                        <span aria-hidden="true" className="absolute inset-0 z-10" />
                                                        Tất cả sản phẩm
                                                    </button>
                                                    <p className="mt-1 text-xs text-blue-300/80">Mua ngay</p>
                                                </div>

                                                <div className="group relative text-sm">
                                                    <img
                                                        src="https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-02.jpg"
                                                        alt="Basic Tees"
                                                        className="aspect-square w-full rounded-lg object-cover bg-slate-700 group-hover:opacity-80 transition"
                                                    />
                                                    <button
                                                        onClick={() => navigate('/search?q=basic-tee')}
                                                        className="mt-3 block font-medium text-white group-hover:text-blue-300 transition"
                                                    >
                                                        <span aria-hidden="true" className="absolute inset-0 z-10" />
                                                        Basic Tees
                                                    </button>
                                                    <p className="mt-1 text-xs text-blue-300/80">Mua ngay</p>
                                                </div>
                                            </div>

                                            {/* Cột danh mục */}
                                            <div className="row-start-1 grid grid-cols-3 gap-x-6 gap-y-8 text-sm">
                                                <div>
                                                    <p className="font-medium text-white">ÁO</p>
                                                    <ul className="mt-4 space-y-3 text-blue-200">
                                                        <li>
                                                            <button onClick={() => navigate('/category/ao-thun')} className="hover:text-blue-300">
                                                                Áo thun
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button onClick={() => navigate('/category/ao-so-mi')} className="hover:text-blue-300">
                                                                Áo sơ mi
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button onClick={() => navigate('/category/ao-khoac')} className="hover:text-blue-300">
                                                                Áo khoác
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <p className="font-medium text-white">QUẦN</p>
                                                    <ul className="mt-4 space-y-3 text-blue-200">
                                                        <li>
                                                            <button onClick={() => navigate('/category/quan-short')} className="hover:text-blue-300">
                                                                Quần Short
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button onClick={() => navigate('/category/quan-dai')} className="hover:text-blue-300">
                                                                Quần dài
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button onClick={() => navigate('/category/quan-jeans')} className="hover:text-blue-300">
                                                                Quần Jeans
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <p className="font-medium text-white">PHỤ KIỆN</p>
                                                    <ul className="mt-4 space-y-3 text-blue-200">
                                                        <li>
                                                            <button onClick={() => navigate('/category/vi-bop')} className="hover:text-blue-300">
                                                                Ví & Bóp
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button onClick={() => navigate('/category/tui-xach')} className="hover:text-blue-300">
                                                                Túi xách
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button onClick={() => navigate('/category/non-that-lung')} className="hover:text-blue-300">
                                                                Nón & Thắt lưng
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverPanel>
                            </Popover>

                            <motion.button
                                className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white hover:text-blue-300 transition-colors duration-200 rounded-lg hover:bg-white/10 font-sans"
                                whileHover={{ scale: 1.05 }}
                            >
                                VỀ CHÚNG TÔI
                            </motion.button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Box */}
                        <div ref={searchContainerRef} className="hidden md:block relative">
                            <div className="flex items-center bg-white/10 backdrop-white-sm rounded-full px-4 py-2 gap-3 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200">
                                <Search className="w-4 h-6 text-blue-300" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    onFocus={() => setShowSuggestions(true)}
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="bg-transparent text-white placeholder-blue-300 outline-none w-80 text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X className="w-3 h-3 text-blue-300" />
                                    </button>
                                )}
                            </div>

                            {/* Search Suggestions Dropdown */}
                            <AnimatePresence>
                                {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-2xl shadow-2xl border border-blue-500/20 overflow-hidden z-50"
                                    >
                                        {/* Recent Searches */}
                                        {searchQuery.length < 2 && searchHistory.length > 0 && (
                                            <div className="p-3 border-b border-blue-500/20">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-blue-300">
                                                        <Clock className="w-3 h-3" />
                                                        Tìm kiếm gần đây
                                                    </div>
                                                    <button
                                                        onClick={clearSearchHistory}
                                                        className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                                <div className="space-y-1">
                                                    {searchHistory.map((item, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleHistoryClick(item)}
                                                            className="w-full text-left p-2 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-2 group text-sm text-white"
                                                        >
                                                            <Clock className="w-3 h-3 text-blue-400 group-hover:text-blue-300" />
                                                            <span>{item}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Search Suggestions */}
                                        {suggestions.length > 0 && (
                                            <div className="p-3">
                                                <div className="flex items-center gap-2 text-xs font-medium text-blue-300 mb-2">
                                                    <TrendingUp className="w-3 h-3" />
                                                    Gợi ý cho bạn
                                                </div>
                                                <div className="space-y-1">
                                                    {suggestions.map((suggestion) => (
                                                        <button
                                                            key={suggestion.id}
                                                            onClick={() => handleSuggestionClick(suggestion)}
                                                            className="w-full text-left p-2 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-3 group text-sm"
                                                        >
                                                            <img
                                                                src={suggestion.image || "/placeholder.svg"}
                                                                alt={suggestion.name}
                                                                className="w-8 h-8 rounded-lg object-cover"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-medium text-white group-hover:text-blue-300">
                                                                    {suggestion.name}
                                                                </div>
                                                                <div className="text-xs text-blue-400">
                                                                    {new Intl.NumberFormat("vi-VN", {
                                                                        style: "currency",
                                                                        currency: "VND",
                                                                    }).format(suggestion.price)}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Search Button for current query */}
                                        {searchQuery.length >= 2 && (
                                            <div className="p-3 border-t border-blue-500/20">
                                                <button
                                                    onClick={() => handleSearch()}
                                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-xl font-medium text-sm hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                                                >
                                                    <Search className="w-4 h-4" />
                                                    Tìm kiếm "{searchQuery}"
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                                <Menu.Button className="flex items-center gap-2 p-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                                    <div className="relative h-10 w-10">
                                        <img
                                            src={user?.image}
                                            alt="Avatar"
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    </div>
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