import React, { useState, useEffect } from "react";
import { 
    FaMoneyBillWave, 
    FaShieldAlt,
    FaCreditCard,
    FaMobileAlt
} from "react-icons/fa";
import { 
    RiSecurePaymentLine
} from "react-icons/ri";
import { 
    ImSpinner8 
} from "react-icons/im";
import { 
    checkoutCOD, 
    checkoutVnpay, 
    fetchCart 
} from "@/redux/action/cartAction.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

const PaymentMethodPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    
    const cart = useSelector(state => state.cart);

    const [selectedMethod, setSelectedMethod] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const paymentMethods = [
        {
            id: "vnpay",
            name: "VNPAY QR",
            icon: <RiSecurePaymentLine className="w-8 h-8 text-blue-500" />,
            description: "Quét mã QR qua ứng dụng ngân hàng",
            badge: "Đề xuất",
            features: ["Hỗ trợ 40+ ngân hàng", "Giao dịch an toàn", "Xử lý ngay lập tức"],
            available: true
        },
        {
            id: "cod",
            name: "Thanh toán khi nhận hàng",
            icon: <FaMoneyBillWave className="w-8 h-8 text-green-500" />,
            description: "Kiểm tra hàng trước khi thanh toán",
            badge: "Tiện lợi",
            features: ["Không cần thanh toán trước", "Kiểm tra hàng trước", "An tâm mua sắm"],
            available: true
        },
        {
            id: "momo",
            name: "Ví MoMo",
            icon: <FaMobileAlt className="w-8 h-8 text-gray-400" />,
            description: "Thanh toán nhanh chóng qua ví điện tử MoMo",
            badge: "Sắp ra mắt",
            features: ["Xác thực nhanh", "Bảo mật cao", "Khuyến mãi"],
            available: false
        },
        {
            id: "card",
            name: "Thẻ Visa/Mastercard",
            icon: <FaCreditCard className="w-8 h-8 text-gray-400" />,
            description: "Thanh toán quốc tế với thẻ tín dụng/ghi nợ",
            badge: "Sắp ra mắt",
            features: ["Chấp nhận thẻ quốc tế", "Bảo mật 3D Secure", "Tỷ giá cạnh tranh"],
            available: false
        }
    ];

    const handleMethodSelect = (methodId) => {
        const method = paymentMethods.find(m => m.id === methodId);
        if (!method.available) {
            toast.info("Phương thức thanh toán này sẽ sớm được cập nhật!");
            return;
        }
        setSelectedMethod(methodId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedMethod) {
            toast.warning("Vui lòng chọn phương thức thanh toán");
            return;
        }

        setIsProcessing(true);

        try {
            const voucher = cart.appliedVoucher;
            const addressId = cart.addressId;
            const shippingFee = cart.shippingFee || 0;

            if (selectedMethod === "cod") {
                const res = await dispatch(checkoutCOD(voucher, addressId, shippingFee));
                if (res.success) {
                    const orderId = res.data?.order?.id;
                    toast.success(`🎉 Đặt hàng thành công! Mã đơn hàng: #${orderId}`);
                    dispatch(fetchCart());
                    navigate("/payment/completed", { 
                        state: { 
                            orderId,
                            paymentMethod: "cod"
                        }
                    });
                } else {
                    toast.error(res.message || "Có lỗi xảy ra khi đặt hàng COD");
                }
            } else if (selectedMethod === "vnpay") {
                const res = await dispatch(checkoutVnpay(voucher, addressId, shippingFee));
                if (res.success) {
                    toast.info("Đang chuyển hướng đến cổng thanh toán VNPAY...");
                    setTimeout(() => {
                        window.location.href = res.data?.paymentUrl;
                    }, 1000);
                    dispatch(fetchCart());
                } else {
                    toast.error(res.message || "Có lỗi xảy ra khi khởi tạo thanh toán VNPAY");
                }
            }
        } catch (err) {
            console.error("Checkout error:", err);
            toast.error("Thanh toán thất bại! Vui lòng thử lại.");
        } finally {
            if (selectedMethod !== "vnpay") {
                setTimeout(() => setIsProcessing(false), 2000);
            }
        }
    };

    const handleBackToCart = () => {
        navigate('/cart');
    };

    if (!cart?.items || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex items-center justify-center">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaShieldAlt className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
                        <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
                        >
                            Tiếp tục mua sắm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-white p-3 rounded-2xl shadow-lg">
                            <RiSecurePaymentLine className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Chọn Phương Thức Thanh Toán
                    </h1>
                    <p className="text-gray-600">
                        Chọn cách thức thanh toán phù hợp cho đơn hàng của bạn
                    </p>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <FaShieldAlt className="w-5 h-5 text-green-500 mr-2" />
                            Phương thức thanh toán
                        </h2>
                        <button
                            onClick={handleBackToCart}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            ← Quay lại giỏ hàng
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                onClick={() => method.available && handleMethodSelect(method.id)}
                                className={`relative p-5 rounded-xl border-2 transition-all duration-300 ${
                                    method.available 
                                        ? selectedMethod === method.id 
                                            ? "border-indigo-500 ring-2 ring-indigo-100 shadow-md cursor-pointer" 
                                            : "border-gray-200 hover:border-indigo-300 hover:shadow-md cursor-pointer"
                                        : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center">
                                        <div className={method.available ? "" : "opacity-50"}>
                                            {method.icon}
                                        </div>
                                        <div className="ml-4">
                                            <h3 className={`text-lg font-semibold ${
                                                method.available ? "text-gray-900" : "text-gray-500"
                                            }`}>
                                                {method.name}
                                            </h3>
                                            <p className={`text-sm mt-1 ${
                                                method.available ? "text-gray-600" : "text-gray-400"
                                            }`}>
                                                {method.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {method.badge && (
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                        method.badge === "Đề xuất" ? "bg-blue-100 text-blue-800" :
                                                        method.badge === "Tiện lợi" ? "bg-green-100 text-green-800" :
                                                        "bg-gray-100 text-gray-800"
                                                    } ${!method.available ? "opacity-50" : ""}`}>
                                                        {method.badge}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {method.available && selectedMethod === method.id && (
                                        <div className="h-6 w-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                                                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing || !selectedMethod}
                        className={`w-full mt-6 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                            isProcessing || !selectedMethod
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                        }`}
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center">
                                <ImSpinner8 className="animate-spin h-5 w-5 mr-3" />
                                Đang xử lý...
                            </span>
                        ) : (
                            'Xác nhận thanh toán'
                        )}
                    </button>
                </div>

                {/* Security Info */}
                <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <FaShieldAlt className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Giao dịch được bảo mật và mã hóa</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodPage;