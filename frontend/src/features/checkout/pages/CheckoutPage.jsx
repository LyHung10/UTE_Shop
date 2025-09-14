import React, { useState } from "react";
import { FaMoneyBillWave } from "react-icons/fa";
import { SiMoneygram } from "react-icons/si";
import { RiSecurePaymentLine } from "react-icons/ri";
import { ImSpinner8 } from "react-icons/im";
import { checkoutCOD, confirmCODPayment } from "@/redux/action/cartAction.jsx";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
const PaymentMethodPage = () => {
    const dispatch = useDispatch();
    const [selectedMethod, setSelectedMethod] = useState("");
    const [error, setError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();
    const cartItems = useSelector(state => state.cart.items);

    const paymentMethods = [
        {
            id: "momo",
            name: "MoMo",
            icon: <SiMoneygram className="w-8 h-8 text-pink-500" />,
            description: "Pay securely using MoMo digital wallet"
        },
        {
            id: "vnpay",
            name: "VNPAY",
            icon: <RiSecurePaymentLine className="w-8 h-8 text-blue-500" />,
            description: "Fast and secure payment with VNPAY"
        },
        {
            id: "cod",
            name: "Cash on Delivery",
            icon: <FaMoneyBillWave className="w-8 h-8 text-green-500" />,
            description: "Pay when you receive your order"
        }
    ];

    const handleMethodSelect = (methodId) => {
        setError("");
        setSelectedMethod(methodId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMethod) {
            setError("Please select a payment method");
            return;
        }

        setIsProcessing(true);
        try {
            if (selectedMethod === "cod") {

                const items = cartItems.map(i => ({
                    product_id: i.product_id,
                    quantity: i.qty,
                    price: i.price
                }));

                // 1. Gửi checkout COD
                const data = await dispatch(checkoutCOD(items));
                const orderId = data.order.id;

                // 2. Confirm COD Payment
                const confirm = await dispatch(confirmCODPayment(orderId));

                alert(`Đặt hàng COD thành công! OrderID: ${confirm.order.id}`);
                dispatch({ type: 'CLEAR_CART' }); // Xóa giỏ hàng trong redux
                dispatch({ type: 'SET_CART_COUNT', payload: 0 }); // Cập nhật lại số lượng giỏ hàng
                navigate("/"); // về trang home
            } else {
                alert(`${selectedMethod} chưa được tích hợp, chọn COD thôi nha 😅`);
            }
        } catch (err) {
            console.error(err);
            alert("Thanh toán thất bại!");
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Choose Payment Method</h2>
                    <p className="mt-2 text-sm text-gray-600">Select your preferred payment option</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                onClick={() => handleMethodSelect(method.id)}
                                tabIndex="0"
                                role="radio"
                                aria-checked={selectedMethod === method.id}
                                className={`relative bg-white p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${selectedMethod === method.id
                                    ? "border-blue-500 ring-2 ring-blue-200"
                                    : "border-gray-200"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        {method.icon}
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-gray-900">{method.name}</h3>
                                            <p className="text-sm text-gray-500">{method.description}</p>
                                        </div>
                                    </div>
                                    {selectedMethod === method.id && (
                                        <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg
                                                className="h-3 w-3 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 12 12"
                                            >
                                                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm mt-2" role="alert">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <ImSpinner8 className="animate-spin h-5 w-5" />
                            ) : (
                                "Proceed to Payment"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentMethodPage;
