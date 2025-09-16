import {Card, CardContent} from "@/components/ui/card.jsx";
import {Star} from "lucide-react";

const ListProducts = ({ listProducts }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listProducts && listProducts.length > 0 ? (
                listProducts.map((item) => (
                    <Card
                        key={item.id}
                        className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transform transition-all duration-100 rounded-xl cursor-pointer"
                    >
                        <CardContent className="!p-2">
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

                            <h4 className="font-semibold mt-4 mb-2 text-lg">{item.name}</h4>

                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">5.0/5</span>
                            </div>

                            <div className="flex items-center gap-2 font-sans">
                <span className="font-bold text-lg">
                  {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                  }).format(item.price)}
                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <span>Not found data</span>
            )}
        </div>
    );
};

export default ListProducts;
