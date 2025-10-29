// components/ProductCard.js
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Star, ShoppingCart, Zap, Clock, Flame } from "lucide-react"
import FavoriteButton from "../../../components/ui/FavoriteButton"
import { useFlashSale } from "@/hooks/useFlashSale"
import ProgressBar from "./ProgressBar"
import { useState, useEffect } from "react"

const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const { getProductFlashSaleInfo } = useFlashSale()
  const [localFlashSaleInfo, setLocalFlashSaleInfo] = useState(null)

  // Fix: Đảm bảo avg_rating là số
  const avgRating = parseFloat(product?.avg_rating) || 0;
  const reviewCount = parseInt(product?.review_count) || 0;

  const createdAtStr = product?.createdAt;
  const isNew = (() => {
    if (!createdAtStr) return false;
    const created = new Date(createdAtStr).getTime();
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return now - created <= sevenDays;
  })();

  // Kiểm tra flash sale
  useEffect(() => {
    const info = getProductFlashSaleInfo(product.id);
    setLocalFlashSaleInfo(info);
  }, [getProductFlashSaleInfo, product.id]);

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

          {/* Flash Sale Badge - ĐÃ CẬP NHẬT */}
          {localFlashSaleInfo && (
            <div className="absolute top-2 left-2 z-10">
              {localFlashSaleInfo.isActive && (
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 border-2 border-white">
                  <Flame className="w-3.5 h-3.5" />
                  <span>FLASH SALE</span>
                </div>
              )}
              {localFlashSaleInfo.isUpcoming && (
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>SẮP MỞ BÁN</span>
                </div>
              )}
            </div>
          )}

          {/* Discount + NEW badge */}
          {(product.discount_percent || isNew) && (
              <div className="absolute top-2 left-2 flex items-center gap-2">
                {product.discount_percent && !localFlashSaleInfo && (
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                      -{product.discount_percent}%
                    </div>
                )}

                {isNew && (
                    <div className="bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                      NEW
                    </div>
                )}
              </div>
          )}

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
        </div>

        <div className="space-y-3">
          <h4 className="text-gray-800 font-semibold text-lg group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {product.name}
          </h4>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => {
                const starNumber = i + 1;

                return (
                  <div key={i} className="relative">
                    <Star className="w-4 h-4 text-gray-300" />
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
              {avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({reviewCount})
            </span>
          </div>

          {/* Price với Flash Sale */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xl font-bold ${localFlashSaleInfo?.isActive ? 'text-red-600' : 'text-blue-600'
                }`}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(
                  localFlashSaleInfo?.isActive
                    ? localFlashSaleInfo.flashProduct.flash_price
                    : product.price
                )}
              </span>

              {/* Hiển thị giá gốc khi có flash sale hoặc discount */}
              {(localFlashSaleInfo || product.original_price) && (
                <span className="text-sm text-gray-400 line-through">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(
                    localFlashSaleInfo?.isActive || localFlashSaleInfo?.isUpcoming
                      ? localFlashSaleInfo.flashProduct.original_price
                      : product.original_price
                  )}
                </span>
              )}

              {/* Hiển thị % giảm giá */}
              {localFlashSaleInfo && (
                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{Math.round((1 - localFlashSaleInfo.flashProduct.flash_price / localFlashSaleInfo.flashProduct.original_price) * 100)}%
                </span>
              )}
            </div>

            {/* Thông tin thời gian flash sale - ĐÃ THÊM */}
            {localFlashSaleInfo?.isActive && (
              <div className="flex flex-col gap-1">
                <div className="text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-lg flex items-center gap-1.5 w-fit">
                  <Zap className="w-3 h-3" />
                  <span>Kết thúc {new Date(localFlashSaleInfo.flashSale.end_time).toLocaleString('vi-VN')}</span>
                </div>
                <ProgressBar
                  sold={localFlashSaleInfo.flashProduct.sold_flash_sale}
                  total={localFlashSaleInfo.flashProduct.stock_flash_sale}
                />
              </div>
            )}

            {/* Thông tin sắp diễn ra */}
            {localFlashSaleInfo?.isUpcoming && (
              <div className="text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-1 rounded-lg flex items-center gap-1.5 w-fit">
                <Clock className="w-3 h-3" />
                <span>BẮT ĐẦU: {new Date(localFlashSaleInfo.flashSale.start_time).toLocaleString('vi-VN')}</span>
              </div>
            )}
          </div>

          {/* Tag */}
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-blue-50 rounded-full border border-blue-200">
              <span className="text-xs text-blue-600 font-medium">Dành cho sinh viên</span>
            </div>
            {localFlashSaleInfo?.isActive && (
              <div className="px-2 py-1 bg-red-50 rounded-full border border-red-200">
                <span className="text-xs text-red-600 font-medium">
                  Giới hạn: {localFlashSaleInfo.flashProduct.limit_per_user}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard