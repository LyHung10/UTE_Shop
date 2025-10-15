import { useEffect, useState } from "react";
import axios from "../../../utils/axiosCustomize.jsx";
import ListProducts from "@/features/product/components/ListProducts.jsx";
import { Heart } from "lucide-react";

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await axios.get("api/favorites/list");
                if (res.success) {
                    // Lấy ra mảng product từ favorites
                    const products = res.favorites.map((fav) => ({
                        ...fav.product,
                        images: fav.product.images || [],
                    }));
                    setFavorites(products);
                }
            } catch (error) {
                console.error("Lỗi khi load favorites:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh] text-lg text-slate-500">
                Đang tải danh sách yêu thích...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">
            {favorites.length > 0 ? (
                <ListProducts listProducts={favorites} />
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <div className="bg-white rounded-full p-6 shadow-md mb-4">
                        <Heart className="w-12 h-12 text-rose-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Danh sách yêu thích trống
                    </h2>
                    <p className="text-gray-500 max-w-sm">
                        Hãy thêm những sản phẩm bạn yêu thích để dễ dàng tìm lại và mua sau này 💖
                    </p>
                    <a
                        href="/category/all"
                        className="mt-6 inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-2.5 px-6 rounded-xl shadow hover:shadow-md transition-all"
                    >
                        Khám phá sản phẩm
                    </a>
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
