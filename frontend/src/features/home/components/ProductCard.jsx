// components/ProductCard.js
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Star, ShoppingCart } from "lucide-react"
import FavoriteButton from "../../../components/ui/FavoriteButton"

const ProductCard = ({ product }) => {
  const navigate = useNavigate()

  // Fix: Đảm bảo avg_rating là số
  const avgRating = parseFloat(product?.avg_rating) || 0;
  const reviewCount = parseInt(product?.review_count) || 0;

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
                e.stopPropagation()
                // Add to cart logic
              }}
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>

            <FavoriteButton productId={product.id} />
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

          {/* Rating - ĐÃ SỬA */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => {
                const starNumber = i + 1;
                
                return (
                  <div key={i} className="relative">
                    {/* Sao nền (luôn hiển thị) */}
                    <Star className="w-4 h-4 text-gray-300" />
                    
                    {/* Sao vàng (phủ lên tùy theo rating) */}
                    <div
                      className="absolute top-0 left-0 overflow-hidden"
                      style={{
                        width: `${avgRating >= starNumber ? 100 : avgRating >= starNumber - 0.5 ? 50 : 0}%`
                      }}
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                );
              })}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {avgRating.toFixed(1)} {/* Đã được parseFloat nên chắc chắn là số */}
            </span>
            <span className="text-xs text-gray-400">
              ({reviewCount}) {/* Đã được parseInt nên chắc chắn là số */}
            </span>
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