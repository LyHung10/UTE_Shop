// components/ProductSlider.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { Button } from "@/components/ui/button.jsx";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard.jsx";
import { useRef } from "react";
import { useFlashSale } from "@/hooks/useFlashSale";
import CountdownTimer from "./CountdownTimer";

const ProductSlider = ({ listProducts, nameTop, slidesPerViewDesktop = 4, showFlashSaleBanner = false }) => {
  const navigate = useNavigate();
  const { activeFlashSales, upcomingFlashSales } = useFlashSale();

  // refs cho nút prev/next
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // Lấy flash sale đầu tiên đang active
  const currentFlashSale = activeFlashSales[0] || upcomingFlashSales[0];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 grid-pattern">
      <div className="container mx-auto px-6">
        {/* Flash Sale Banner */}
        {showFlashSaleBanner && currentFlashSale && (
          <motion.div
            className="text-center mb-8 p-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-4 mb-3">
              <Zap className="w-8 h-8 text-white animate-pulse" />
              <h2 className="text-3xl font-bold text-white">{currentFlashSale.name}</h2>
              <Zap className="w-8 h-8 text-white animate-pulse" />
            </div>

            <p className="text-white/90 mb-4 text-lg">{currentFlashSale.description}</p>

            <div className="flex items-center justify-center gap-6">
              {currentFlashSale.status === 'active' && (
                <>
                  <div className="text-white font-semibold text-lg">Kết thúc sau:</div>
                  <CountdownTimer
                    endTime={currentFlashSale.end_time}
                    type="end"
                  />
                  <div className="text-white/80 text-sm">
                    Bắt đầu: {new Date(currentFlashSale.start_time).toLocaleString('vi-VN')}
                  </div>
                </>
              )}

              {currentFlashSale.status === 'upcoming' && (
                <>
                  <div className="text-white font-semibold text-lg">Bắt đầu sau:</div>
                  <CountdownTimer
                    startTime={currentFlashSale.start_time}
                    type="start"
                  />
                  <div className="text-white/80 text-sm">
                    Kết thúc: {new Date(currentFlashSale.end_time).toLocaleString('vi-VN')}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent neon-text">
            {nameTop}
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
        </motion.div>

        <div className="relative max-w-7xl mx-auto">
          {/* Nút PREV/NEXT */}
          <motion.button
            ref={prevRef}
            type="button"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 animate-glow pointer-events-auto"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            ref={nextRef}
            type="button"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 animate-glow pointer-events-auto"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>

          <Swiper
            modules={[Navigation, Autoplay]}
            slidesPerView={slidesPerViewDesktop}
            spaceBetween={24}
            loop
            speed={800}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            observer
            observeParents
            watchOverflow
            onBeforeInit={(swiper) => {
              swiper.params.navigation = swiper.params.navigation || {};
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            onInit={(swiper) => {
              setTimeout(() => {
                if (swiper.navigation) {
                  swiper.navigation.destroy?.();
                  swiper.navigation.init?.();
                  swiper.navigation.update?.();
                }
              }, 0);
            }}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="px-16"
          >
            {Array.isArray(listProducts) && listProducts.length > 0 ? (
              listProducts.map((item, index) => (
                <SwiperSlide key={item.id ?? index}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard product={item} />
                  </motion.div>
                </SwiperSlide>
              ))
            ) : (
              <div className="text-center text-slate-400 py-12">
                Không tìm thấy sản phẩm
              </div>
            )}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;