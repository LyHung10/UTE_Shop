import React, { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Clock, TrendingUp, Filter } from "lucide-react"
import { searchProducts, getSearchSuggestions } from "@/services/searchService"
import ProductCard from "../../home/components/ProductCard"

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [searchHistory, setSearchHistory] = useState([])
    const [searchPerformed, setSearchPerformed] = useState(false)

    const searchInputRef = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()

    // Lấy query từ URL params khi trang được load
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)
        const query = urlParams.get('q')

        // chỉ search khi mount lần đầu hoặc khi URL query thay đổi khác với state hiện tại
        if (query && query !== searchQuery) {
            setSearchQuery(query)
            handleSearch(query, false) // thêm flag để khỏi navigate lại
        }

        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
        setSearchHistory(history)
    }, [location])


    // Debounce cho search suggestions
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSuggestions([])
            return
        }

        const timer = setTimeout(async () => {
            try {
                const data = await getSearchSuggestions(searchQuery)
                if (data && data.success) {
                    setSuggestions(data.suggestions || [])
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Xử lý tìm kiếm chính
    const handleSearch = async (query = searchQuery, shouldNavigate = true) => {
        if (!query.trim()) return
        setLoading(true)
        setShowSuggestions(false)
        setSearchPerformed(true)

        try {
            const data = await searchProducts(query)
            if (data && data.success) {
                setProducts(data.data?.products || [])
                addToSearchHistory(query)
                if (shouldNavigate) {
                    navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true })
                }
            }
        } catch (error) {
            console.error("Search error:", error)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }


    // Thêm vào lịch sử tìm kiếm
    const addToSearchHistory = (query) => {
        const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5)
        setSearchHistory(newHistory)
        localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    }

    // Xóa lịch sử tìm kiếm
    const clearSearchHistory = () => {
        setSearchHistory([])
        localStorage.setItem('searchHistory', '[]')
    }

    // Xử lý khi click suggestion
    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion.name)
        handleSearch(suggestion.name)
    }

    // Xử lý khi nhấn Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    // Clear search
    const clearSearch = () => {
        setSearchQuery("")
        setProducts([])
        setSuggestions([])
        setSearchPerformed(false)
        navigate('/search')
        searchInputRef.current?.focus()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-32 pb-20">
            <div className="container mx-auto px-4">
                {/* Search Header */}
                <motion.div
                    className="max-w-4xl mx-auto mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
                        Tìm Kiếm Sản Phẩm
                    </h1>
                    <p className="text-lg text-center text-gray-600 mb-8">
                        Khám phá hàng ngàn sản phẩm dành cho sinh viên UTE
                    </p>

                    {/* Search Box */}
                    <div className="relative">
                        <div className="relative bg-white rounded-2xl shadow-2xl shadow-blue-500/10 border border-blue-200/50 hover:border-blue-300 transition-all duration-300">
                            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Tìm kiếm sản phẩm, ví dụ: bút bi, sổ tay, balo..."
                                className="w-full pl-16 pr-12 py-5 text-lg bg-transparent outline-none placeholder-gray-400 text-gray-800"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Search Suggestions Dropdown */}
                        <AnimatePresence>
                            {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                                >
                                    {/* Recent Searches */}
                                    {searchQuery.length < 2 && searchHistory.length > 0 && (
                                        <div className="p-4 border-b border-gray-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                    <Clock className="w-4 h-4" />
                                                    Tìm kiếm gần đây
                                                </div>
                                                <button
                                                    onClick={clearSearchHistory}
                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Xóa tất cả
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {searchHistory.map((item, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            setSearchQuery(item)
                                                            handleSearch(item)
                                                        }}
                                                        className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3 group"
                                                    >
                                                        <Clock className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                                        <span className="text-gray-700 group-hover:text-blue-600">{item}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Search Suggestions */}
                                    {suggestions.length > 0 && (
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                                <TrendingUp className="w-4 h-4" />
                                                Đề xuất cho bạn
                                            </div>
                                            <div className="space-y-2">
                                                {suggestions.map((suggestion) => (
                                                    <button
                                                        key={suggestion.id}
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-4 group"
                                                    >
                                                        <img
                                                            src={suggestion.image || "/placeholder.svg"}
                                                            alt={suggestion.name}
                                                            className="w-10 h-10 rounded-lg object-cover"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900 group-hover:text-blue-600">
                                                                {suggestion.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
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

                                    {/* Search Button */}
                                    {searchQuery.length >= 2 && (
                                        <div className="p-4 border-t border-gray-100">
                                            <button
                                                onClick={() => handleSearch()}
                                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                <Search className="w-5 h-5" />
                                                Tìm kiếm "{searchQuery}"
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Search Results */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="max-w-4xl mx-auto text-center py-20"
                        >
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Đang tìm kiếm sản phẩm...</p>
                        </motion.div>
                    ) : searchPerformed ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="max-w-7xl mx-auto"
                        >
                            {/* Results Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Kết quả tìm kiếm cho "{searchQuery}"
                                    </h2>
                                    <p className="text-gray-600 mt-2">
                                        Tìm thấy {products.length} sản phẩm phù hợp
                                    </p>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:border-blue-500 transition-colors">
                                    <Filter className="w-4 h-4" />
                                    Lọc
                                </button>
                            </div>

                            {/* Products Grid */}
                            {products.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20"
                                >
                                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Search className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Không tìm thấy sản phẩm phù hợp
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Hãy thử tìm kiếm với từ khóa khác hoặc duyệt danh mục sản phẩm
                                    </p>
                                    <button
                                        onClick={() => navigate('/categories')}
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                                    >
                                        Duyệt danh mục
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="max-w-4xl mx-auto text-center py-20"
                        >
                            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                <Search className="w-16 h-16 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Bắt đầu tìm kiếm của bạn
                            </h3>
                            <p className="text-gray-600 text-lg max-w-md mx-auto">
                                Nhập từ khóa tìm kiếm để khám phá hàng ngàn sản phẩm chất lượng dành cho sinh viên UTE
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Click outside to close suggestions */}
            {showSuggestions && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSuggestions(false)}
                />
            )}
        </div>
    )
}

export default SearchPage