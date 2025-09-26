"use client"

import { useEffect, useState } from "react"
import axios from "../../../utils/axiosCustomize.jsx"
import ProductSlider from "../../home/components/ProductSlider.jsx"

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await axios.get("api/favorites/list")
                if (res.success) {
                    // Lấy ra mảng product từ favorites
                    const products = res.favorites.map(fav => ({
                        ...fav.product,
                        // Đồng bộ cho ProductCard (nếu có images thì backend trả, còn ko thì để mảng rỗng)
                        images: fav.product.images || []
                    }))
                    setFavorites(products)
                }
            } catch (error) {
                console.error("Lỗi khi load favorites:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchFavorites()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh] text-lg text-slate-500">
                Đang tải danh sách yêu thích...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <ProductSlider listProducts={favorites} nameTop="Sản phẩm yêu thích của bạn"  slidesPerViewDesktop={3} />
        </div>
    )
}

export default FavoritesPage
