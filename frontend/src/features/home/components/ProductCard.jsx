"use client"

import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Star, ShoppingCart, Heart } from "lucide-react"

import { useSelector, useDispatch } from "react-redux"
import { addFavorite, removeFavorite, checkFavorite } from "../../../redux/action/favoriteActions.jsx"
import toast from "react-hot-toast";
import { useEffect } from "react"
const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // xử lí nút tim
  const favoriteMap = useSelector(state => state.favorite.favoriteMap)
  const isFavorite = favoriteMap[product?.id] || false
  const loading = useSelector((state) => state.favorite.loading);

  useEffect(() => {
    if (product?.id) {
      dispatch(checkFavorite(product.id));
    }
  }, [dispatch, product?.id]);
  const handleToggleFavorite = () => {
    if (!product?.id) return

    if (isFavorite) {
      dispatch(removeFavorite(product.id))
      toast.success("Removed from favorites")
    } else {
      dispatch(addFavorite(product.id))
      toast.success("Added to favorites")
    }
  }

  return (
    <motion.div
      className="group cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="relative bg-slate-50 rounded-2xl p-4 border border-gray-200 hover:border-blue-300 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-100">
        <div className="relative overflow-hidden rounded-xl mb-4 bg-gray-50">
          <img
            src={product.images?.[0]?.url || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Overlay buttons */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <motion.button
              className="p-2 bg-white shadow-md rounded-full text-gray-700 hover:text-blue-500 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                navigate(`/product/${product.id}`)

                // e.stopPropagation()
                // Add to cart logic
              }}
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>

            <motion.button
              className={`p-2 bg-white shadow-md rounded-full transition-colors ${isFavorite ? "text-red-500" : "text-gray-700 hover:text-red-500"
                }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </motion.button>

          </div>

          {/* Discount badge */}
          {product.discount_percent && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
              -{product.discount_percent}%
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-gray-800 font-semibold text-lg group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {product.name}
          </h4>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">{product.avg_rating}</span>
            <span className="text-xs text-gray-400">({product.review_count} đánh giá)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(product.price)}
            </span>

            {product.original_price && (
              <span className="text-sm text-gray-400 line-through">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(product.original_price)}
              </span>
            )}
          </div>

          {/* Tag */}
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-blue-50 rounded-full border border-blue-200">
              <span className="text-xs text-blue-600 font-medium">Dành cho sinh viên</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
