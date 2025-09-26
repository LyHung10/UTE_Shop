"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"
import { Navigation, Autoplay } from "swiper/modules"
import { Button } from "@/components/ui/button.jsx"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import ProductCard from "./ProductCard.jsx"

const ProductSlider = ({ listProducts, nameTop, slidesPerViewDesktop = 4 }) => {
  const navigate = useNavigate()

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 grid-pattern">
      <div className="container mx-auto px-6">
        {/* Title */}
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
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Slider */}
        <Swiper
          modules={[Navigation, Autoplay]}
          slidesPerView={slidesPerViewDesktop}
          spaceBetween={24}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          navigation={{
            prevEl: "#custom-prev",
            nextEl: "#custom-next",
          }}
          speed={800}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: slidesPerViewDesktop, spaceBetween: 24 },
          }}
          className="px-16"
        >
          {listProducts?.length > 0 ? (
            listProducts.map((item, index) => (
              <SwiperSlide key={item.id}>
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
              <p>Không tìm thấy sản phẩm</p>
            </div>
          )}
        </Swiper>
      </div>
    </section>
  )
}


export default ProductSlider
