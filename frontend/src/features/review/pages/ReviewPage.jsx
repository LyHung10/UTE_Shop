import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, ArrowLeft, CheckCircle, AlertCircle, Send, PackageCheck, Sparkles } from "lucide-react";
import { getOrderDetail } from "@/services/orderService.jsx";
import { createReview } from "@/services/reviewService.jsx";
import { formatPrice } from "@/utils/format.jsx";
import {fetchUser} from "@/redux/action/userAction.jsx";

export default function ReviewPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [orderData, setOrderData] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [reviewableProducts, setReviewableProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [pointsInfo, setPointsInfo] = useState({ points: 0, totalProducts: 0 });

    useEffect(() => {
        if (!orderId || orderId === "undefined") {
            setError("Không tìm thấy mã đơn hàng");
            setLoading(false);
            return;
        }

        const fetchOrderAndFilterProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const orderRes = await getOrderDetail(orderId);

                if (orderRes.success && orderRes.data) {
                    setOrderData(orderRes.data);

                    const allItems = orderRes.data.items || [];
                    setAllProducts(allItems);

                    // Tính điểm tích lũy: 500 × số sản phẩm trong order
                    const totalProducts = allItems.length;
                    const totalPoints = 500 * totalProducts;
                    setPointsInfo({
                        points: totalPoints,
                        totalProducts: totalProducts
                    });

                    const notReviewedItems = allItems.filter(item =>
                        item.status !== "COMMENTED"
                    );

                    console.log("📦 All items:", allItems.length);
                    console.log("⭐ Reviewable items:", notReviewedItems.length);
                    console.log("💰 Total points:", totalPoints);

                    const initialReviews = notReviewedItems.map(item => ({
                        product_id: item.product.id,
                        product_name: item.product.name,
                        product_image: item.product.image,
                        color: item.color,
                        size: item.size,
                        rating: 0,
                        text: "",
                        submitted: false,
                        order_item_id: item.id
                    }));

                    setReviewableProducts(notReviewedItems);
                    setReviews(initialReviews);

                    if (notReviewedItems.length === 0) {
                        setError("Tất cả sản phẩm trong đơn hàng này đã được đánh giá");
                    }
                } else {
                    setError(orderRes?.message || "Không thể tải thông tin đơn hàng");
                }
            } catch (err) {
                console.error("❌ Error fetching order detail:", err);
                setError(err?.message || "Có lỗi xảy ra khi tải đơn hàng");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderAndFilterProducts();
    }, [orderId]);

    const handleRatingChange = (productId, rating) => {
        setReviews(prev => prev.map(review =>
            review.product_id === productId
                ? { ...review, rating }
                : review
        ));
    };

    const handleReviewTextChange = (productId, text) => {
        setReviews(prev => prev.map(review =>
            review.product_id === productId
                ? { ...review, text }
                : review
        ));
    };

    const handleSubmitAllReviews = async () => {
        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const reviewsToSubmit = reviews
                .filter(review => review.rating > 0)
                .map(({ product_id, rating, text }) => ({
                    product_id,
                    rating,
                    text: text.trim()
                }));

            if (reviewsToSubmit.length === 0) {
                setError("Vui lòng chọn ít nhất 1 sao cho sản phẩm bạn muốn đánh giá");
                return;
            }

            const result = await createReview({
                order_id: parseInt(orderId),
                reviews: reviewsToSubmit
            });

            if (result.success) {
                setSuccess(result.message);

                const successfulProductIds = result.data.success.map(item => item.product_id);
                setReviews(prev => prev.map(review =>
                    successfulProductIds.includes(review.product_id)
                        ? { ...review, submitted: true }
                        : review
                ));

                setReviewableProducts(prev =>
                    prev.filter(item =>
                        !successfulProductIds.includes(item.product.id)
                    )
                );

                // Hiển thị thông tin điểm từ response
                if (result.points_earned) {
                    setPointsInfo(prev => ({
                        ...prev,
                        points: result.points_earned
                    }));
                }
                setTimeout(() => {
                    navigate(`/user/my-orders`);
                }, 2000);
            } else {
                setError(result.message || "Có lỗi xảy ra khi gửi đánh giá");
            }
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra khi gửi đánh giá");
        } finally {
            setSubmitting(false);
        }
    };

    const ratedCount = reviews.filter(review => review.rating > 0).length;
    const submittedCount = reviews.filter(review => review.submitted).length;
    const alreadyReviewedCount = allProducts.filter(item => item.status === "COMMENTED").length;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-slate-600 font-medium">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (!orderId || orderId === "undefined") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md w-full text-center border border-slate-200">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Có lỗi xảy ra</h2>
                    <p className="text-slate-600 mb-8">Không tìm thấy mã đơn hàng</p>
                    <button
                        onClick={() => navigate("/user/my-orders")}
                        className="w-full bg-slate-900 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/10"
                    >
                        Quay lại danh sách đơn hàng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 border-t border-b border-slate-200 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/user/order-detail/${orderId}`)}
                        className="group inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-all duration-200 font-medium"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 group-hover:bg-slate-50 transition-all duration-200">
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                        <span>Quay lại chi tiết đơn hàng</span>
                    </button>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
                        <div className="relative">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                                        Đánh giá sản phẩm
                                    </h1>
                                    <p className="text-slate-600">
                                        Đơn hàng <span className="font-semibold text-slate-900">#{orderId}</span> • {orderData?.order?.created_at
                                            ? new Date(orderData.order.created_at).toLocaleDateString('vi-VN')
                                            : ''
                                        }
                                    </p>
                                </div>
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="h-7 w-7 text-indigo-600" />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="bg-slate-50 text-slate-700 px-4 py-2 rounded-full text-sm font-medium border border-slate-200">
                                    {allProducts.length} sản phẩm
                                </div>

                                {reviewableProducts.length > 0 && (
                                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
                                        {reviewableProducts.length} cần đánh giá
                                    </div>
                                )}
                                {ratedCount > 0 && (
                                    <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-medium border border-amber-200">
                                        ⭐ {ratedCount} đã chọn sao
                                    </div>
                                )}
                                {/* Hiển thị điểm tích lũy */}
                                <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium border border-purple-200">
                                    🎁 {pointsInfo.points.toLocaleString()} điểm
                                </div>
                            </div>

                            {/* Thông tin điểm tích lũy chi tiết */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-purple-900 font-semibold">
                                            Nhận ngay {pointsInfo.points.toLocaleString()} điểm tích lũy!
                                        </p>
                                        <p className="text-purple-700 text-sm">
                                            {pointsInfo.totalProducts} sản phẩm × 500 điểm = {pointsInfo.points.toLocaleString()} điểm
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-red-900 font-semibold mb-1">Có lỗi xảy ra</p>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-emerald-900 font-semibold mb-1">Thành công!</p>
                            <p className="text-emerald-700 text-sm">{success}</p>
                        </div>
                    </div>
                )}

                {/* Already Reviewed Notice */}
                {alreadyReviewedCount > 0 && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-emerald-900 font-semibold mb-1">
                                Bạn đã đánh giá {alreadyReviewedCount} sản phẩm
                            </p>
                            <p className="text-emerald-700 text-sm">
                                Cảm ơn bạn đã chia sẻ đánh giá!
                            </p>
                        </div>
                    </div>
                )}

                {/* Review Products */}
                {reviewableProducts.length > 0 ? (
                    <>
                        <div className="space-y-5">
                            {reviews.map((review) => (
                                <div
                                    key={review.product_id}
                                    className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300"
                                >
                                    <div className="p-8">
                                        <div className="flex gap-6">
                                            <div className="flex-shrink-0">
                                                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm">
                                                    <img
                                                        src={review.product_image}
                                                        alt={review.product_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-900 text-xl mb-2 leading-tight">
                                                    {review.product_name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                                                    {review.color && (
                                                        <span className="px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
                                                            {review.color}
                                                        </span>
                                                    )}
                                                    {review.size && (
                                                        <span className="px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
                                                            {review.size}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Rating Stars */}
                                                <div className="mb-6">
                                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                        Đánh giá của bạn
                                                        {review.rating > 0 && (
                                                            <span className="ml-2 text-amber-600">
                                                                • {review.rating} ⭐
                                                            </span>
                                                        )}
                                                    </label>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => handleRatingChange(review.product_id, star)}
                                                                disabled={review.submitted}
                                                                className={`group transition-all duration-200 ${review.submitted ? 'cursor-not-allowed' : 'hover:scale-110'
                                                                    }`}
                                                            >
                                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${star <= review.rating
                                                                        ? 'bg-amber-50'
                                                                        : 'bg-slate-50 group-hover:bg-amber-50'
                                                                    }`}>
                                                                    <Star
                                                                        className={`h-7 w-7 transition-all duration-200 ${star <= review.rating
                                                                                ? 'fill-amber-400 text-amber-400'
                                                                                : 'text-slate-300 group-hover:text-amber-300'
                                                                            }`}
                                                                    />
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Review Text */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                        Nhận xét của bạn
                                                        {review.submitted && (
                                                            <span className="ml-2 text-emerald-600">• Đã gửi</span>
                                                        )}
                                                    </label>
                                                    <textarea
                                                        value={review.text}
                                                        onChange={(e) => handleReviewTextChange(review.product_id, e.target.value)}
                                                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                                                        disabled={review.submitted}
                                                        rows={3}
                                                        className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:cursor-not-allowed resize-none transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                                                    />
                                                </div>

                                                {review.submitted && (
                                                    <div className="flex items-center gap-2 text-emerald-600 mt-4 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100 w-fit">
                                                        <CheckCircle className="h-4 w-4" />
                                                        <span className="text-sm font-semibold">Đánh giá đã được gửi</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sticky bottom-4">
                            <div className="flex items-center justify-between gap-6">
                                <div>
                                    <p className="text-slate-900 font-semibold text-lg mb-1">
                                        {ratedCount === reviews.length
                                            ? "Bạn đã đánh giá tất cả sản phẩm"
                                            : `${ratedCount}/${reviews.length} sản phẩm đã được chọn sao`
                                        }
                                    </p>
                                    {ratedCount > 0 && (
                                        <p className="text-slate-500 text-sm">
                                            Nhấn gửi đánh giá để hoàn tất và nhận <span className="font-semibold text-purple-600">{pointsInfo.points.toLocaleString()} điểm tích lũy</span>
                                            <br />
                                            <span className="text-slate-400 text-xs">({pointsInfo.totalProducts} sản phẩm × 500 điểm)</span>
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handleSubmitAllReviews}
                                    disabled={submitting || ratedCount === 0}
                                    className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 whitespace-nowrap"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5" />
                                            Gửi {ratedCount} đánh giá
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* No Products to Review */
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
                        <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <PackageCheck className="h-12 w-12 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">
                            Tất cả sản phẩm đã được đánh giá
                        </h3>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                            Bạn đã đánh giá tất cả {allProducts.length} sản phẩm trong đơn hàng #{orderId}.
                            Cảm ơn bạn đã chia sẻ đánh giá!
                        </p>
                        <button
                            onClick={() => navigate(`/user/order-detail/${orderId}`)}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/10 hover:shadow-xl inline-flex items-center gap-2"
                        >
                            Quay lại chi tiết đơn hàng
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}