import Steps from "rc-steps";
import  "../../../styles/OrderProgress.css"
import {
    ReceiptText, Wallet, Truck, PackageCheck, Star, XCircle
} from "lucide-react";
const formatVN = (iso) =>
    iso
        ? new Date(iso).toLocaleString("vi-VN", {
            hour12: false, hour: "2-digit", minute: "2-digit",
            day: "2-digit", month: "2-digit", year: "numeric",
        })
        : "";

export default function EnhancedOrderProgress(props) {
    const {
        currentStep = 1,
        status,
        total,
        timeline = {},
    } = props
    console.log(currentStep);
    const cancelled = String(status || "").toUpperCase() === "CANCELLED";

    if (cancelled) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Đơn hàng đã hủy
            </div>
        );
    }

    const items = [
        {
            title: <div className="text-sm font-medium">Đơn Hàng Đã Đặt</div>,
            description: <div className="text-xs">{formatVN(timeline.placedAt)}</div>,
            icon: <ReceiptText className="h-4 w-4" />,
            status: currentStep >= 1 ? "finish" : "wait",
        },
        {
            title: (
                <div className="text-sm font-medium">
                    Đơn Hàng Đã Thanh Toán{total ? ` (${total.toLocaleString("vi-VN")}₫)` : ""}
                </div>
            ),
            description: <div className="text-xs">{formatVN(timeline.paidAt)}</div>,
            icon: <Wallet className="h-4 w-4" />,
            status: currentStep >= 2 ? "finish" : "wait",
        },
        {
            title: <div className="text-sm font-medium">Đã Giao Cho ĐVVC</div>,
            description: <div className="text-xs">{formatVN(timeline.handedAt)}</div>,
            icon: <Truck className="h-4 w-4" />,
            status: currentStep >= 3 ? "finish" : "wait",
        },
        {
            title: <div className="text-sm font-medium">Đã Nhận Được Hàng</div>,
            description: <div className="text-xs">{formatVN(timeline.receivedAt)}</div>,
            icon: <PackageCheck className="h-4 w-4" />,
            status: currentStep >= 4 ? "finish" : "wait",
        },
        {
            title: <div className="text-sm font-medium">Đánh Giá</div>,
            description: <div className="text-xs">{formatVN(timeline.reviewedAt)}</div>,
            icon: <Star className="h-4 w-4" />,
            status: currentStep >= 5 ? "finish" : "wait",
        },
    ];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <Steps className="!flex !items-start" current={currentStep} items={items} labelPlacement="vertical" />
        </div>
    );
}
