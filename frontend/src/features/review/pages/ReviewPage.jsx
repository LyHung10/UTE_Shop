import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../../utils/axiosCustomize.jsx"
import { Star } from "lucide-react";

const ReviewPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get("orderId");
    const productId = searchParams.get("productId");

    const [product, setProduct] = useState(null);
    const [rating, setRating] = useState(0);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // load product info
        axios.get(`api/products/${productId}`).then((res) => {
            setProduct(res);
        });
    }, [productId]);

    const handleSubmit = async () => {
        if (!rating || !text) {
            alert("Vui lòng nhập đủ nội dung và chọn số sao!");
            return;
        }
        setLoading(true);
        try {
            await axios.post("api/reviews", {
                order_id: orderId,
                product_id: productId,
                rating,
                text,
            });
            alert("Đánh giá thành công!");
            navigate("/user/my-orders");
        } catch (err) {
            alert(err.response?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 md:p-8">
                {product ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <img
                                // src={product.images[0].url}
                                alt={product.name}
                                className="h-20 w-20 rounded-lg object-cover border"
                            />
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">{product.name}</h1>
                                <p className="text-sm text-gray-500">Mã đơn #{orderId}</p>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="mb-6">
                            <h2 className="text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</h2>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-8 w-8 cursor-pointer transition-colors ${star <= rating
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-300"
                                            }`}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Textarea */}
                        <div className="mb-6">
                            <textarea
                                rows="4"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            disabled={loading}
                            onClick={handleSubmit}
                            className="w-full rounded-lg bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 transition-transform transform hover:scale-105 disabled:opacity-50"
                        >
                            {loading ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                    </>
                ) : (
                    <div className="text-center text-gray-500">Đang tải sản phẩm...</div>
                )}
            </div>
        </div>
    );
};

export default ReviewPage;
