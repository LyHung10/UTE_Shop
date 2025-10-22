import { Button } from "@/components/ui/button.jsx"
import { Card, CardContent } from "@/components/ui/card.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Star } from "lucide-react"
import banner from "../../../assets/coming_soon.jpg"
import { Sparkles, TrendingUp, Users, Award, ShoppingBag, ArrowRight } from "lucide-react"
// import banner2 from "../../../assets/ao_khoa_chinh_tri_luat.jpg"
import ProductSlider from "@/features/home/components/ProductSlider.jsx"
import {
  getBestSellingProducts,
  getMostViewedProducts,
  getNewestProducts,
  getTopDiscountProducts,
} from "@/services/productService.jsx"
import { useEffect, useState } from "react"
import {fetchUser} from "@/redux/action/userAction.jsx";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate()
  const [listTopNewestProducts, setListTopNewestProducts] = useState([])
  const [listTopDiscountProducts, setListTopDiscountProducts] = useState([])
  const [listTopMostViewedProducts, setListTopMostViewedProducts] = useState([])
  const [listBestSellingProducts, setListBestSellingProducts] = useState([])
  const fetchListTopDiscountProducts = async () => {
    const data = await getTopDiscountProducts()
    setListTopDiscountProducts(data)
  }
  const fetchListBestSellingProducts = async () => {
    const data = await getBestSellingProducts()
    setListBestSellingProducts(data)
  }
  const fetchListTopNewestProducts = async () => {
    const data = await getNewestProducts()
    setListTopNewestProducts(data)
  }
  const fetchTopMostViewedProducts = async () => {
    const data = await getMostViewedProducts()
    setListTopMostViewedProducts(data)
  }
  const loadData = () => {
    fetchListTopNewestProducts()
    fetchListTopDiscountProducts()
    fetchTopMostViewedProducts()
    fetchListBestSellingProducts()
  }
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUser());
    loadData()
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-200/20 rounded-full blur-3xl"></div>

      {/* Hero Section - ĐÃ SỬA BỐ CỤC */}
      <section className="relative z-10 py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12 xl:px-20 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Left Content - ĐÃ ĐIỀU CHỈNH KHOẢNG CÁCH */}
            <div className="lg:w-1/2 space-y-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full border border-blue-200 shadow-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Welcome to UTE SHOP</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                    FIND CLOTHES
                  </span>
                  <br />
                  <span className="text-gray-900">THAT MATCHES</span>
                  <br />
                  <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    YOUR STYLE
                  </span>
                </h1>

                {/* Decorative line */}
                <div className="flex items-center gap-4">
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  <Sparkles className="w-6 h-6 text-cyan-500 animate-pulse" />
                  <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"></div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-lg lg:text-xl leading-relaxed max-w-xl">
                Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
              </p>

              {/* CTA Buttons - ĐÃ SỬA KÍCH THƯỚC BUTTON */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-7 py-5 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-h-12 flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    SHOP NOW
                    <ArrowRight className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                  </div>

                </Button>
                <Button
                  variant="outline"
                  onClick={()=>  navigate("/category/all")}
                  className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 px-7 py-5 rounded-xl text-base font-semibold transition-all hover:scale-105 min-h-12"
                >
                  TẤT CẢ SẢN PHẨM
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-12">
                <div className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        200+
                      </div>
                    </div>
                    <div className="text-gray-600 text-sm font-medium">International Brands</div>
                  </div>
                </div>

                <div className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-cyan-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                        2,000+
                      </div>
                    </div>
                    <div className="text-gray-600 text-sm font-medium">Quality Products</div>
                  </div>
                </div>

                <div className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-teal-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                        30K+
                      </div>
                    </div>
                    <div className="text-gray-600 text-sm font-medium">Happy Customers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image - ĐÃ ĐIỀU CHỈNH KHOẢNG CÁCH */}
            <div className="lg:w-1/2 relative">
              <div className="relative">
                {/* Main image container with decorative elements */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white mx-auto max-w-2xl">
                  <img
                    src={banner}
                    alt="Fashion Collection"
                    className="w-full h-[500px] lg:h-[600px] object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
                </div>

                {/* Decorative floating elements */}
                <div className="absolute -top-4 -right-4 lg:-top-6 lg:-right-6 w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl rotate-12 shadow-xl animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 w-28 h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-2xl -rotate-12 shadow-xl"></div>

                {/* Floating sparkles */}
                <div className="absolute top-8 right-8 lg:top-10 lg:right-10">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-16 left-8 lg:bottom-20 lg:left-10">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute top-16 left-6 lg:top-20 lg:left-8">
                  <div className="bg-white/95 backdrop-blur-sm px-5 py-2.5 lg:px-6 lg:py-3 rounded-2xl shadow-xl border border-blue-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs lg:text-sm font-bold text-gray-800">New Arrivals</span>
                    </div>
                  </div>
                </div>

                {/* Decorative stars */}
                <div className="absolute top-28 right-10 lg:top-32 lg:right-12 text-cyan-400 text-4xl lg:text-5xl opacity-70 animate-spin-slow">✦</div>
                <div className="absolute bottom-28 left-12 lg:bottom-32 lg:left-16 text-blue-400 text-3xl lg:text-4xl opacity-70 animate-pulse">✦</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>

      <div className="border-t border-gray-200"></div>
      <ProductSlider listProducts={listTopNewestProducts} nameTop={"NEW ARRIVALS"} />
      <div className="border-t border-gray-200"></div>
      <ProductSlider listProducts={listTopDiscountProducts} nameTop="BEST DEALS" />
      <div className="border-t border-gray-200"></div>
      <ProductSlider listProducts={listTopMostViewedProducts} nameTop="MOST VIEWED" />
      <div className="border-t border-gray-200"></div>
      <ProductSlider listProducts={listBestSellingProducts} nameTop="BEST SELLERS" />
      <div className="border-t border-gray-200"></div>

      {/* Customer Reviews */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-6 lg:px-12 xl:px-20 max-w-7xl">
          <h3 className="text-3xl font-bold mb-12 text-black text-center">OUR HAPPY CUSTOMERS</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <h5 className="font-semibold text-gray-900">Sarah M.</h5>
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to
                  elegant dresses, every piece I've bought has exceeded my expectations."
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <h5 className="font-semibold text-gray-900">Alex K.</h5>
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co.
                  The range of options they offer is truly remarkable, catering to a variety of tastes and occasions."
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <h5 className="font-semibold text-gray-900">James L.</h5>
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon
                  Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}