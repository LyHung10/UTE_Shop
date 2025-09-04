import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Star } from "lucide-react";

const TopNewArrivals = () => {
    const productCard = (title, price) => (
        <Card className="border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
                <div className="bg-gray-100 rounded-xl p-8 mb-4">
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">{title}</span>
                    </div>
                </div>
                <h4 className="font-semibold mb-2">{title}</h4>
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400">
                        {[...Array(4)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                        <Star className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-gray-600">4.5/5</span>
                </div>
                <div className="font-bold text-lg">{price}</div>
            </CardContent>
        </Card>
    );

    return (
        <section className="py-16">
            <div className="container mx-auto px-6">
                <h3 className="text-3xl font-bold text-center mb-12 text-black">
                    NEW ARRIVALS
                </h3>

                <Swiper
                    modules={[Navigation]}
                    slidesPerView={4}
                    spaceBetween={24}
                    navigation
                    loop={true}
                    breakpoints={{
                        640: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 4 },
                    }}
                >
                    <SwiperSlide>{productCard("T-shirt with Tape Details", "$120")}</SwiperSlide>
                    <SwiperSlide>{productCard("Skinny Fit Jeans", "$240")}</SwiperSlide>
                    <SwiperSlide>{productCard("Checkered Shirt", "$180")}</SwiperSlide>
                    <SwiperSlide>{productCard("Striped Tee", "$130")}</SwiperSlide>
                    <SwiperSlide>{productCard("Casual Hoodie", "$210")}</SwiperSlide>
                </Swiper>

                <div className="text-center mt-10">
                    <Button className="px-8 py-3 rounded-full bg-black text-white hover:bg-gray-800">
                        View All
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default TopNewArrivals;
