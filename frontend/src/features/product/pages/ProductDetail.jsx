import { useState, useEffect } from "react"
import { Star, ChevronDown, Plus, Minus, Heart, Share2, Shield, Truck, RotateCcw, Eye, Sparkles } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Navigation, Thumbs, Autoplay, EffectFade } from "swiper/modules"
import ProductSlider from "../../home/components/ProductSlider.jsx"
import { getSimilarProducts } from "@/services/productService.jsx"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/navigation"
import "swiper/css/thumbs"
import "swiper/css/effect-fade"
import "swiper/css/autoplay"
import { toast } from "react-toastify";
import { useRef } from "react"
import { useParams } from "react-router-dom"
import { getProductById } from "@/services/productService.jsx"
import { addToCart } from "@/redux/action/cartAction.jsx"
import axios from "../../../utils/axiosCustomize.jsx"
import { cartRef } from "../../home/components/Header.jsx"
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"
import { checkFavorite } from "@/redux/action/favoriteActions.jsx"
import FavoriteButton from "../../../components/ui/FavoriteButton.jsx"
import { useFlashSale } from "@/hooks/useFlashSale"
import CountdownTimer from "../../home/components/CountdownTimer.jsx"
import ProgressBar from "../../home/components/ProgressBar"
import { Zap, Clock } from "lucide-react"

const ProductDetail = () => {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [reviews, setReviews] = useState([])
    const [loadingReviews, setLoadingReviews] = useState(false)
    const [listSimilarProducts, setListSimilarProducts] = useState([])
    const [thumbsSwiper, setThumbsSwiper] = useState(null)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    //sản phẩm yêu thích
    // const favoriteMap = useSelector(state => state.favorite.favoriteMap);
    // const isFavorite = favoriteMap[product?.id] || false;
    const loading = useSelector((state) => state.favorite.loading);
    // Hàm kiểm tra số lượng hợp lệ
    const validateQuantity = (qty) => {
        const availableStock = product?.inventory?.stock - product?.inventory?.reserved;

        if (qty < 1) {
            toast.error("Số lượng phải lớn hơn 0");
            return false;
        }

        if (qty > availableStock) {
            toast.error(`Số lượng vượt quá tồn kho. Chỉ còn ${availableStock} sản phẩm`);
            return false;
        }

        return true;
    };

    // Hàm xử lý thay đổi số lượng từ input
    const handleQuantityChange = (e) => {
        const value = e.target.value;

        // Cho phép input rỗng tạm thời
        if (value === "") {
            setQuantity("");
            return;
        }

        // Chỉ cho phép nhập số
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) {
            return;
        }

        setQuantity(numValue);
    };

    // Hàm xử lý khi blur khỏi input
    const handleQuantityBlur = (e) => {
        const value = e.target.value;

        if (value === "") {
            setQuantity(1);
            return;
        }

        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
            setQuantity(1);
            toast.error("Số lượng phải lớn hơn 0");
        } else {
            if (!validateQuantity(numValue)) {
                const availableStock = product?.inventory?.stock - product?.inventory?.reserved;
                setQuantity(availableStock || 1);
            }
        }
    };
    useEffect(() => {
        if (product?.id) {
            dispatch(checkFavorite(product.id));
        }
    }, [dispatch, product?.id]);

    const handleTryOn = () => {
        const clothUrl = product.images[0]?.url; // ảnh đầu tiên của sản phẩm
        navigate("/tryon", { state: { clothUrl } });
    };
    const fetchSimilarProducts = async () => {
        const data = await getSimilarProducts(id);
        if (data) {
            setListSimilarProducts(data.items);
        }
    }

    const [relatedProducts] = useState([])
    const [activeTab, setActiveTab] = useState("reviews")
    const [selectedColor, setSelectedColor] = useState(null)
    const [selectedSize, setSelectedSize] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [visibleCount, setVisibleCount] = useState(4)

    const colorMap = {
        Red: "bg-gradient-to-br from-red-400 to-red-600",
        Blue: "bg-gradient-to-br from-blue-400 to-blue-600",
        Black: "bg-gradient-to-br from-gray-800 to-black",
        Gray: "bg-gradient-to-br from-gray-400 to-gray-600",
        Brown: "bg-gradient-to-br from-yellow-600 to-yellow-800",
        White: "bg-gradient-to-br from-gray-100 to-white border border-gray-300",
        Silver: "bg-gradient-to-br from-gray-300 to-gray-400",
        Gold: "bg-gradient-to-br from-yellow-300 to-yellow-500",
    }
    // Tìm hàm handleAddToCart, sửa thành:
    const handleAddToCart = async () => {
        if (!selectedSize || !selectedColor) {
            toast.error("Vui lòng chọn size và màu sắc")
            return
        }

        // Kiểm tra flash sale
        if (flashSaleInfo?.isActive) {
            // Validate số lượng flash sale
            const availableFlashStock = flashSaleInfo.flashProduct.stock_flash_sale - flashSaleInfo.flashProduct.sold_flash_sale;
            if (quantity > availableFlashStock) {
                toast.error(`Chỉ còn ${availableFlashStock} sản phẩm trong flash sale`);
                return;
            }
            if (quantity > flashSaleInfo.flashProduct.limit_per_user) {
                toast.error(`Vượt quá giới hạn mua (tối đa ${flashSaleInfo.flashProduct.limit_per_user} sản phẩm)`);
                return;
            }
        }

        const result = await dispatch(addToCart(product.id, quantity, selectedColor.name, selectedSize))
        if (result.success) {
            toast.success(result.message);
            animateAddToCart()

            // Refresh flash sale data sau khi thêm vào giỏ hàng
            if (flashSaleInfo?.isActive) {
                setTimeout(() => refreshFlashSales(), 1000);
            }
        } else {
            toast.error(result.message);
        }
    }

    const [isAnimating, setIsAnimating] = useState(false)
    const productImageRef = useRef(null)

    // Thêm hook flash sale
    const { getProductFlashSaleInfo, refreshFlashSales } = useFlashSale()
    const flashSaleInfo = getProductFlashSaleInfo(product?.id)
    useEffect(() => {
        if (!product?.id) return

        const fetchReviews = async () => {
            try {
                setLoadingReviews(true)
                const res = await axios.get(`api/reviews/product/${product.id}`)
                setReviews(res)
            } catch (err) {
                console.error("Lỗi load reviews:", err)
            } finally {
                setLoadingReviews(false)
            }
        }

        fetchReviews()
    }, [product?.id])

    const animateAddToCart = () => {
        if (isAnimating) return
        setIsAnimating(true)

        const productImg = productImageRef.current
        const cartIcon = cartRef.current
        if (!productImg || !cartIcon) {
            setIsAnimating(false)
            return
        }

        const productRect = productImg.getBoundingClientRect()
        const cartRect = cartRef.current.getBoundingClientRect()

        const flyingImg = productImg.cloneNode(true)
        flyingImg.style.position = "fixed"
        flyingImg.style.top = productRect.top + "px"
        flyingImg.style.left = productRect.left + "px"
        flyingImg.style.width = productRect.width + "px"
        flyingImg.style.height = productRect.height + "px"
        flyingImg.style.zIndex = "9999"
        flyingImg.style.pointerEvents = "none"
        flyingImg.style.borderRadius = "12px"
        flyingImg.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        flyingImg.style.boxShadow = "0 20px 40px rgba(59, 130, 246, 0.4)"

        document.body.appendChild(flyingImg)

        setTimeout(() => {
            flyingImg.style.top = cartRect.top + cartRect.height / 2 + "px"
            flyingImg.style.left = cartRect.left + cartRect.width / 2 + "px"
            flyingImg.style.width = "20px"
            flyingImg.style.height = "20px"
            flyingImg.style.opacity = "0.8"
            flyingImg.style.transform = `translateY(-40px)`
        }, 10)

        setTimeout(() => {
            cartIcon.style.transform = "scale(1.3)"
            cartIcon.style.transition = "transform 0.2s ease-out"
        }, 600)

        setTimeout(() => {
            cartIcon.style.transform = "scale(1)"
        }, 800)

        setTimeout(() => {
            if (document.body.contains(flyingImg)) {
                document.body.removeChild(flyingImg)
            }
            setIsAnimating(false)
            cartIcon.style.transform = ""
            cartIcon.style.transition = ""

            const badge = document.querySelector(".cart-badge")
            if (badge) {
                badge.style.transform = "scale(1.5)"
                badge.style.transition = "transform 0.2s ease-out"
                setTimeout(() => {
                    badge.style.transform = "scale(1)"
                }, 200)
            }
        }, 850)
    }

    useEffect(() => {
        const fetchData = async () => {
            const res = await getProductById(id)
            setProduct(res)
        }
        fetchData()
        fetchSimilarProducts()
    }, [id])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <span className="hover:text-blue-600 transition-colors cursor-pointer"
                              onClick={() => navigate("/")}
                        >Home</span>
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="hover:text-blue-600 transition-colors cursor-pointer"
                              onClick={() => navigate(`/category/${product?.category?.slug}`)}
                        >{product?.category.name}</span>
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="text-orange-500 font-medium">{product?.name}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Product Images */}
                    <div className="space-y-6">
                        {product && (
                            <div className="relative">
                                {/* Main Image Swiper */}
                                <Swiper
                                    spaceBetween={10}
                                    navigation={true}
                                    thumbs={{ swiper: thumbsSwiper }}
                                    modules={[FreeMode, Navigation, Thumbs, Autoplay, EffectFade]}
                                    className="main-swiper rounded-2xl overflow-hidden shadow-2xl"
                                    onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                                    effect="fade"
                                    fadeEffect={{ crossFade: true }}
                                >
                                    {product.images.map((img, idx) => (
                                        <SwiperSlide key={img.id}>
                                            <div className="relative aspect-square bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl overflow-hidden group shadow-lg">
                                                <img
                                                    ref={idx === 0 ? productImageRef : null}
                                                    src={img.url || "/placeholder.svg"}
                                                    alt={img.alt}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />


                                                {/* Flash Sale Badge trên ảnh */}
                                                {flashSaleInfo && idx === 0 && (
                                                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                                        {flashSaleInfo.isActive && (
                                                            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                                                                <Zap className="w-4 h-4" />
                                                                <span>FLASH SALE</span>
                                                            </div>
                                                        )}
                                                        {flashSaleInfo.isUpcoming && (
                                                            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                <span>SẮP DIỄN RA</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {/* Thumbnail Swiper */}
                                <Swiper
                                    onSwiper={setThumbsSwiper}
                                    spaceBetween={12}
                                    slidesPerView={4}
                                    freeMode={true}
                                    watchSlidesProgress={true}
                                    modules={[FreeMode, Navigation, Thumbs]}
                                    className="thumbnail-swiper mt-4"
                                >
                                    {product.images.map((img, idx) => (
                                        <SwiperSlide key={img.id}>
                                            <div
                                                className={`aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${idx === activeImageIndex
                                                    ? "ring-2 ring-orange-400 shadow-lg shadow-orange-400/25"
                                                    : "ring-1 ring-gray-200 hover:ring-gray-300 shadow-md"
                                                    }`}
                                            >
                                                <img src={img.url || "/placeholder.svg"} alt={img.alt} className="w-full h-full object-cover" />
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                <div className="absolute top-4 right-4 flex gap-2 z-10">
                                    {/* Favorite Button */}
                                    <FavoriteButton
                                        productId={product?.id}
                                        size="large"
                                    />
                                    <button className="p-3 rounded-full backdrop-blur-sm bg-white/90 border border-gray-200 text-gray-600 hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-lg">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Try On Button - Đặt xuống dưới Swiper */}
                                {product?.tryon && (
                                    <div className="mt-6 flex justify-center">
                                        <button
                                            onClick={handleTryOn}
                                            onMouseEnter={() => setIsHovered(true)}
                                            onMouseLeave={() => setIsHovered(false)}
                                            className="cursor-pointer group relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105"
                                        >
                                            {/* Animated border gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

                                            {/* Inner button */}
                                            <div className="relative bg-white rounded-2xl px-8 py-4 flex items-center gap-3 min-w-[200px] justify-center">
                                                {/* Magic particles animation */}
                                                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                                    {[...Array(6)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000 ${isHovered ? 'animate-bounce' : 'opacity-0'
                                                                }`}
                                                            style={{
                                                                left: `${20 + i * 12}%`,
                                                                top: `${20 + (i % 2) * 40}%`,
                                                                animationDelay: `${i * 0.1}s`,
                                                            }}
                                                        />
                                                    ))}
                                                </div>

                                                {/* AI Eye icon with animation */}
                                                <div className="relative">
                                                    <div className={`absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm transition-all duration-300 ${isHovered ? 'scale-150 opacity-70' : 'scale-100 opacity-0'
                                                        }`} />
                                                    <Eye className={`relative w-5 h-5 text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'
                                                        }`} />
                                                </div>

                                                {/* Text with gradient */}
                                                <span className="relative font-semibold text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text">
                                                    Try On with AI
                                                </span>

                                                {/* Sparkles icon with rotation */}
                                                <Sparkles className={`w-5 h-5 text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text transition-transform duration-500 ${isHovered ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
                                                    }`} />

                                                {/* Shimmer effect */}
                                                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transform -translate-x-full transition-all duration-1000 ${isHovered ? 'translate-x-full opacity-30' : '-translate-x-full opacity-0'
                                                    }`} />
                                            </div>

                                            {/* Glow effect */}
                                            <div className={`absolute -inset-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl transition-all duration-500 ${isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
                                                }`} />
                                        </button>
                                    </div>
                                )}
                            </div>

                        )}
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{product?.name}</h1>
                            {/* Flash Sale Banner */}
                            {flashSaleInfo && (
                                <div className="mb-4 p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Zap className="w-6 h-6 animate-pulse" />
                                            <div>
                                                <h3 className="font-bold text-lg">{flashSaleInfo.flashSale.name}</h3>
                                                <p className="text-sm opacity-90">{flashSaleInfo.flashSale.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {flashSaleInfo.isActive && (
                                                <>
                                                    <span className="font-semibold">Kết thúc sau:</span>
                                                    <CountdownTimer
                                                        endTime={flashSaleInfo.flashSale.end_time}
                                                        type="end"
                                                        onStatusChange={() => refreshFlashSales()}
                                                    />
                                                </>
                                            )}
                                            {flashSaleInfo.isUpcoming && (
                                                <>
                                                    <span className="font-semibold">Bắt đầu sau:</span>
                                                    <CountdownTimer
                                                        startTime={flashSaleInfo.flashSale.start_time}
                                                        type="start"
                                                        onStatusChange={() => refreshFlashSales()}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Ratings */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => {
                                        const rating = product?.avg_rating || 0;
                                        const starNumber = i + 1;

                                        return (
                                            <div key={i} className="relative">
                                                {/* Sao nền (luôn hiển thị) */}
                                                <Star className="w-5 h-5 text-gray-300" />

                                                {/* Sao vàng (phủ lên tùy theo rating) */}
                                                <div
                                                    className="absolute top-0 left-0 overflow-hidden"
                                                    style={{
                                                        width: `${rating >= starNumber ? 100 : rating >= starNumber - 0.5 ? 50 : 0}%`
                                                    }}
                                                >
                                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <span className="text-gray-700 font-medium">
                                    {(product?.avg_rating || 0).toFixed(1)}/5
                                </span>
                                <span className="text-gray-500">
                                    ({product?.review_count || 0} đánh giá)
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                {/* Giá flash sale nếu có */}
                                {flashSaleInfo?.isActive ? (
                                    <>
                                        <span className="text-4xl font-bold text-red-600">
                                            {Number(flashSaleInfo.flashProduct.flash_price).toLocaleString("vi-VN", {
                                                style: "currency", currency: "VND"
                                            })}
                                        </span>
                                        <span className="text-xl text-gray-400 line-through">
                                            {Number(flashSaleInfo.flashProduct.original_price).toLocaleString("vi-VN", {
                                                style: "currency", currency: "VND"
                                            })}
                                        </span>
                                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                            -{Math.round((1 - flashSaleInfo.flashProduct.flash_price / flashSaleInfo.flashProduct.original_price) * 100)}%
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-4xl font-bold text-orange-500">
                                            {product?.price
                                                ? Number(product.price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                                                : ""}
                                        </span>
                                        {product?.original_price && (
                                            <span className="text-xl text-gray-400 line-through">
                                                {Number(product.original_price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                            </span>
                                        )}
                                        {product?.discount_percent > 0 && (
                                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                                -{product.discount_percent}%
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>

                            <p className="text-gray-700 leading-relaxed mb-4">{product?.short_description}</p>

                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-600 font-medium">
                                    Còn lại: {product?.inventory?.stock - product?.inventory?.reserved} / {product?.inventory?.stock}
                                </span>
                            </div>

                            {/* Flash Sale Progress */}
                            {flashSaleInfo?.isActive && (
                                <div className="mb-6 space-y-2">
                                    <ProgressBar
                                        sold={flashSaleInfo.flashProduct.sold_flash_sale}
                                        total={flashSaleInfo.flashProduct.stock_flash_sale}
                                        height={4}
                                    />
                                    <div className="flex justify-between text-sm text-gray-600">
                                        {/* <span>Đã bán: {flashSaleInfo.flashProduct.sold_flash_sale}</span> */}
                                        {/* <span>Còn lại: {flashSaleInfo.flashProduct.stock_flash_sale - flashSaleInfo.flashProduct.sold_flash_sale}</span> */}
                                        <span className="text-red-600 font-semibold">
                                            Giới hạn: {flashSaleInfo.flashProduct.limit_per_user} sản phẩm/người
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Thông tin flash sale sắp diễn ra */}
                            {flashSaleInfo?.isUpcoming && (
                                <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-orange-700">
                                        <Clock className="w-4 h-4" />
                                        <span className="font-semibold">Flash Sale sẽ bắt đầu vào:</span>
                                        <span>{new Date(flashSaleInfo.flashSale.start_time).toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-8 shadow-lg">
                            {/* Colors */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Colors</h3>
                                <div className="flex gap-3">
                                    {product?.colors?.map((color, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedColor(color)}
                                            className={` cursor-pointer w-12 h-12 rounded-full ${colorMap[color.name]} transition-all duration-300 ${selectedColor?.name === color.name
                                                ? "ring-4 ring-orange-400 ring-offset-2 ring-offset-white shadow-lg shadow-orange-400/25 scale-110"
                                                : "hover:scale-105 shadow-lg ring-1 ring-gray-200"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Sizes */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Size</h3>
                                <div className="flex gap-3">
                                    {product?.sizes?.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`cursor-pointer px-6 py-3 text-sm font-medium border rounded-xl transition-all duration-300 ${selectedSize === size
                                                ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white border-orange-400 shadow-lg shadow-orange-500/25"
                                                : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => {
                                            const newQuantity = Math.max(1, quantity - 1);
                                            if (validateQuantity(newQuantity)) {
                                                setQuantity(newQuantity);
                                            }
                                        }}
                                        className="cursor-pointer p-4 hover:bg-gray-100 transition-colors text-gray-700"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>

                                    {/* Input field để nhập số lượng trực tiếp */}
                                    <input
                                        type="text"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        onBlur={handleQuantityBlur}
                                        onKeyPress={(e) => {
                                            // Chỉ cho phép nhập số
                                            if (!/[0-9]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-16 px-2 py-4 text-center text-gray-900 font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-400 rounded"
                                    />

                                    <button
                                        onClick={() => {
                                            const newQuantity = quantity + 1;
                                            if (validateQuantity(newQuantity)) {
                                                setQuantity(newQuantity);
                                            }
                                        }}
                                        className="cursor-pointer p-4 hover:bg-gray-100 transition-colors text-gray-700"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAnimating}
                                    className={`cursor-pointer flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 ${isAnimating
                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                        : "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25"
                                        }`}
                                >
                                    {isAnimating ? "Adding to Cart..." : "Add to Cart"}
                                </button>

                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Shield className="w-5 h-5 text-green-500" />
                                    <span className="text-sm">Secure Payment</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Truck className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm">Free Shipping</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <RotateCcw className="w-5 h-5 text-orange-500" />
                                    <span className="text-sm">Easy Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                    <div className="flex border-b border-gray-200">
                        {[
                            { key: "reviews", label: "Rating & Reviews", count: reviews.length },
                            { key: "details", label: "Product Details" },
                            { key: "faqs", label: "FAQs" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-8 py-6 text-sm font-medium border-b-2 transition-all duration-300 ${activeTab === tab.key
                                    ? "border-orange-400 text-orange-500 bg-orange-50"
                                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                {tab.label} {tab.count && `(${tab.count})`}
                            </button>
                        ))}
                    </div>

                    {/* Reviews Tab */}
                    {activeTab === "reviews" && (
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-gray-900">All Reviews ({reviews.length})</h3>
                                <div className="flex gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                                        <span>Latest</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-lg">
                                        Write a Review
                                    </button>
                                </div>
                            </div>

                            {loadingReviews ? (
                                <div className="text-center text-gray-600 py-12">
                                    <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    Đang tải reviews...
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center text-gray-500 py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Star className="w-8 h-8 text-gray-400" />
                                    </div>
                                    Chưa có review nào
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {reviews.slice(0, visibleCount).map((review) => (
                                            <div
                                                key={review.id}
                                                className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-all duration-300"
                                            >
                                                {/* Thông tin user */}
                                                <div className="flex items-center gap-3 mb-3">
                                                    <img
                                                        src={review.User?.image || "/default-avatar.png"}
                                                        alt={review.User?.first_name || "user"}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            {review.User?.first_name + " " + review.User?.last_name || `User #${review.user_id}`}
                                                        </p>
                                                        {review.size || review.color ? (
                                                            <p className="text-xs text-gray-500">
                                                                Đã mua: {review.size || "-"} | Màu: {review.color || "-"}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                {/* Rating trong từng review */}
                                                <div className="flex items-center gap-1 mb-2">
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
                                                                        width: `${review.rating >= starNumber ? 100 : review.rating >= starNumber - 0.5 ? 50 : 0}%`
                                                                    }}
                                                                >
                                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
                                                </div>

                                                {/* Nội dung review */}
                                                <p className="text-gray-700 text-sm leading-relaxed mb-3">{review.text}</p>

                                                {/* Hình ảnh review */}
                                                {review.images?.length > 0 && (
                                                    <div className="flex gap-2 mb-3">
                                                        {review.images.map((img, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={img || "/placeholder.svg"}
                                                                alt={`review-img-${idx}`}
                                                                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Ngày tạo */}
                                                <span className="text-xs text-gray-500">
                                                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Nút load thêm */}
                                    {visibleCount < reviews.length && (
                                        <div className="text-center mt-8">
                                            <button
                                                onClick={() => setVisibleCount((prev) => prev + 4)}
                                                className="px-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                                            >
                                                Load More Reviews
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                    {/* Details Tab */}
                    {activeTab === "details" && (
                        <div className="p-8">
                            <p className="text-gray-600 leading-relaxed mb-4">{product?.description}</p>
                        </div>
                    )}
                    {/* FAQs Tab */}
                </div>

                <div className="mt-20">
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                        <ProductSlider listProducts={listSimilarProducts}
                            nameTop="SIMILAR PRODUCTS" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail
