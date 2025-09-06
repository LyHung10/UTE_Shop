import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import {Navigation} from "swiper/modules";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Star } from "lucide-react";
import 'swiper/css';
import 'swiper/css/navigation';
import '../../../styles/TopProduct.css'
import 'swiper/css/effect-fade';

const ProductSlider = (props) => {
    const {listProducts, nameTop} = props;
    return (
        <section className="py-8">
            <div className="container mx-auto px-35">
                <h3 className="text-3xl font-bold text-center mb-3 text-black">
                    {nameTop}
                </h3>

                <div className="flex items-center gap-4">
                    {/* Nút Prev */}
                    <button
                        id="custom-prev"
                        className= " rounded-full p-2 text-black transition duration-300 hover:shadow-lg hover:scale-105 "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                            />
                        </svg>
                    </button>

                    {/* Swiper */}
                    <Swiper
                        modules={[Navigation]}
                        slidesPerView={4}
                        spaceBetween={20}
                        loop={false}
                        navigation={{
                            prevEl: "#custom-prev",
                            nextEl: "#custom-next",
                        }}
                        speed={800} // tốc độ animation
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 4 },
                        }}
                        className="flex-1">
                        {listProducts && listProducts.length > 0 ? (
                            listProducts.map((item) => (
                                <SwiperSlide key={item.id}>
                                    <Card className="border-0 shadow-md hover:shadow-xl my-4 hover:-translate-y-1 transform transition-all duration-100 rounded-xl">
                                        <CardContent className="!p-3">
                                            <div className="h-65 bg-white rounded-lg mb-4">
                                                <div className="size-full rounded flex items-center justify-center">
                                                    {item.images && item.images.length > 0 ? (
                                                        <img
                                                            src={item.images[0].url}
                                                            alt={item.images[0].alt}
                                                            className="object-contain rounded w-full h-full"
                                                        />
                                                    ) : (
                                                        <div className="text-gray-500">{item.slug}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <h4 className="font-semibold mb-2 text-lg">{item.name}</h4>

                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className="w-4 h-4 fill-current" />
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-600">5.0/5</span>
                                            </div>

                                            <div className="flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                                                {
                                                    nameTop === "BEST DEALS" ? (
                                                        <>
                                                            <span className="font-bold text-lg">
                                                                {new Intl.NumberFormat("vi-VN", {
                                                                style: "currency",
                                                                currency: "VND",
                                                            }).format(item.price)}</span>
                                                            <span className="text-gray-500 line-through">
                                                                {new Intl.NumberFormat("vi-VN", {
                                                                style: "currency",
                                                                currency: "VND",
                                                            }).format(item.original_price)}</span>
                                                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">{`-${item.discount_percent}%`}</span>
                                                        </>
                                                    ) : (
                                                        <span className="font-bold text-lg">
                                                          {new Intl.NumberFormat("vi-VN", {
                                                              style: "currency",
                                                              currency: "VND",
                                                          }).format(item.price)}
                                                        </span>
                                                    )
                                                }
                                            </div>
                                        </CardContent>
                                    </Card>
                                </SwiperSlide>
                            ))
                        ) : (
                            <span>Not found data</span>
                        )}
                    </Swiper>

                    {/* Nút Next */}
                    <button
                        id="custom-next"
                        className= " rounded-full p-2 text-black transition duration-300 hover:shadow-lg hover:scale-105 "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 rotate-180"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                            />
                        </svg>
                    </button>
                </div>


                <div className="text-center mt-4">
                    <Button className="px-8 py-3 rounded-full bg-black text-white hover:bg-gray-800">
                        View All
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default ProductSlider;
