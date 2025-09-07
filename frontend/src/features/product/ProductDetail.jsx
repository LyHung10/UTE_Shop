"use client"
import { useState, useEffect } from "react";
import { Star, ChevronDown, Plus, Minus } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";

import ProductSlider from "@/features/home/components/ProductSlider.jsx";
import { getBestSellingProducts } from "../../services/productService.jsx";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import { useParams } from "react-router-dom"
import { getProductById } from "../../services/productService.jsx"
const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);

    const [listBestSellingProducts, setListBestSellingProducts] = useState([]);
    const fetchListBestSellingProducts = async () => {
        let data = await getBestSellingProducts();
        setListBestSellingProducts(data);
    };
    const [reviews] = useState([]);
    const [relatedProducts] = useState([]);
    const [activeTab, setActiveTab] = useState("details");
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null);
    const [visibleCount, setVisibleCount] = useState(4);
    const colorMap = {
        "Red": "bg-red-500",
        "Blue": "bg-blue-500",
        "Black": "bg-black",
        "Gray": "bg-gray-500",
        "Brown": "bg-yellow-700",
        "White": "bg-white",
        "Silver": "bg-gray-300",
        "Gold": "bg-yellow-400"
    };
    useEffect(() => {
        const fetchData = async () => {
            const res = await getProductById(id);
            setProduct(res);
        };
        fetchData();
        fetchListBestSellingProducts();
    }, [id]);

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb */}
            <div className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center text-sm text-gray-500">
                        <span>Home</span>
                        <span className="mx-2">/</span>
                        <span>Shop</span>
                        <span className="mx-2">/</span>
                        <span>Men</span>
                        <span className="mx-2">/</span>
                        <span className="text-black">T-Shirts</span>
                    </div>
                </div>
            </div>

            {/* Main Product Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        {product && (
                            <div className="flex gap-4">
                                {/* Thumbnail list */}
                                <div className="flex flex-col gap-4">
                                    {product.images.map((img, idx) => (
                                        <img
                                            key={img.id}
                                            src={img.url}
                                            alt={img.alt}
                                            onClick={() => setSelectedImage(img)} // ?? click d? d?i ?nh
                                            className={`w-20 h-20 object-cover rounded-lg border cursor-pointer ${selectedImage?.id === img.id
                                                ? "border-2 border-black"
                                                : "border-gray-200"
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Main Image */}
                                <div className="flex-1">
                                    <img
                                        src={selectedImage?.url || product.images[0]?.url} // ?? l?y ?nh du?c ch?n, n?u chua ch?n th� m?c d?nh ?nh d?u
                                        alt={selectedImage?.alt || product.images[0]?.alt}
                                        className="w-full h-96 object-cover rounded-lg"
                                    />
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-black mb-2">{product?.name}</h1>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">4.5/5</span>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl font-bold text-black">
                                    {product?.price
                                        ? Number(product.price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                                        : ""}
                                </span>
                                <span className="text-xl text-gray-400 line-through">
                                    {product?.original_price
                                        ? Number(product.original_price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                                        : ""}
                                </span>

                                {product?.discount_percent > 0 && (
                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-medium">
                                        -{product.discount_percent}%
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-600 leading-relaxed">{product?.short_description}</p>
                            <p className="text-gray-600 leading-relaxed mt-2">{product?.description}</p>
                            <p className="text-sm text-gray-500">
                                Còn lại: {product?.inventory?.stock - product?.inventory?.reserved} / {product?.inventory?.stock}
                            </p>

                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="space-y-6">
                                {/* Colors */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Select Colors</h3>
                                    <div className="flex gap-3">


                                        {product?.colors?.map((color, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-8 h-8 rounded-full ${colorMap[color.name]} ${selectedColor?.name === color.name ? "ring-2 ring-offset-2 ring-black" : ""}`}
                                            />
                                        ))}

                                    </div>
                                </div>

                                {/* Sizes */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Choose Size</h3>
                                    <div className="flex gap-2">
                                        {product?.sizes?.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-4 py-2 text-sm border rounded-full ${selectedSize === size
                                                    ? "bg-black text-white border-black"
                                                    : "bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>


                                {/* Quantity and Add to Cart */}
                                <div className="flex gap-4">
                                    <div className="flex items-center border border-gray-200 rounded-full">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50">
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                                        <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button className="flex-1 bg-black text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800 transition-colors">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="mt-16 border-t border-gray-200">
                    <div className="flex border-b border-gray-200">
                        {["Product Details", "Rating & Reviews", "FAQs"].map((tab, index) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(["details", "reviews", "faqs"][index])}
                                className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === ["details", "reviews", "faqs"][index]
                                    ? "border-black text-black"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Reviews Tab */}
                    {activeTab === "reviews" && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">All Reviews ({product?.reviews?.length || 0})</h3>
                                <div className="flex gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm">
                                        <span>Latest</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <button className="px-4 py-2 bg-black text-white rounded-full text-sm">Write a Review</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {product?.reviews?.slice(0, visibleCount).map((review) => (
                                    <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="font-medium">{review.user_name}</span>
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.text}</p>
                                        <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString("vi-VN")}</span>
                                    </div>
                                ))}
                            </div>

                            {visibleCount < product?.reviews?.length && (
                                <div className="text-center mt-8">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 4)}
                                        className="px-6 py-2 border border-gray-200 rounded-full text-sm hover:bg-gray-50"
                                    >
                                        Load More Reviews
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Product Details Tab */}

                </div>

                {/* You Might Also Like */}
                <div className="mt-0">
                    <h2 className="text-3xl font-bold text-center">YOU MIGHT ALSO LIKE</h2>
                    <div>
                        <ProductSlider
                            listProducts={listBestSellingProducts}
                        // nameTop="BEST SELLERS"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedProducts.map((product, index) => (
                            <div key={index} className="group">
                                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                                    <img
                                        src={product.image || "/placeholder.svg"}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <h3 className="font-medium text-sm mb-2">{product.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{product.price}</span>
                                    {product.originalPrice && (
                                        <span className="text-gray-400 line-through text-sm">{product.originalPrice}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="bg-black text-white mt-20">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">STAY UPTO DATE ABOUT</h2>
                            <h2 className="text-3xl font-bold">OUR LATEST OFFERS</h2>
                        </div>
                        <div className="space-y-4 w-full md:w-auto">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="w-full md:w-80 px-4 py-3 rounded-full text-black pr-12"
                                />
                                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white px-4 py-2 rounded-full text-sm">
                                    Subscribe to Newsletter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        <div className="md:col-span-1">
                            <h3 className="text-2xl font-bold mb-4">SHOP.CO</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                We have clothes that suits your style and which you're proud to wear. From women to men.
                            </p>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-xs">f</span>
                                </div>
                                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">t</span>
                                </div>
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-xs">in</span>
                                </div>
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-xs">ig</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-4">COMPANY</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>About</li>
                                <li>Features</li>
                                <li>Works</li>
                                <li>Career</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-4">HELP</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>Customer Support</li>
                                <li>Delivery Details</li>
                                <li>Terms & Conditions</li>
                                <li>Privacy Policy</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-4">FAQ</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>Account</li>
                                <li>Manage Deliveries</li>
                                <li>Orders</li>
                                <li>Payments</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-4">RESOURCES</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>Free eBooks</li>
                                <li>Development Tutorial</li>
                                <li>How to - Blog</li>
                                <li>Youtube Playlist</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-600">Shop.co � 2000-2023, All Rights Reserved</p>
                        <div className="flex gap-2 mt-4 md:mt-0">
                            <img src="/visa-logo-generic.png" alt="Visa" className="h-6" />
                            <img src="/mastercard-logo.png" alt="Mastercard" className="h-6" />
                            <img src="/paypal-logo.png" alt="PayPal" className="h-6" />
                            <img src="/apple-pay-logo.png" alt="Apple Pay" className="h-6" />
                            <img src="src/assets/google-pay.png" alt="Google Pay" className="h-6" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default ProductDetail
