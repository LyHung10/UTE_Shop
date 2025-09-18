import { CheckCircle } from "lucide-react";

export default function PaymentCompleted() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Thanh toán thành công 🎉
                </h1>
                <p className="text-gray-600 mb-6">
                    Cảm ơn bạn đã mua sắm tại <span className="font-semibold">UteShop</span>.
                    Đơn hàng của bạn đã được xác nhận!
                </p>

                <a
                    href="/"
                    className="inline-block bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl shadow transition-all"
                >
                    Quay về trang chủ
                </a>
            </div>
        </div>
    );
}
