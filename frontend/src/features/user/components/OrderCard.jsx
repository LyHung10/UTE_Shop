import {CheckCircle2, ChevronRight, Clock, Package, Truck, Warehouse, XCircle} from "lucide-react";
import {formatDateTime, formatPrice} from "@/utils/format.jsx";
import {useNavigate} from "react-router-dom";
import {postCancelOrder} from "@/services/orderService.jsx";
import {toast} from "react-toastify";
import { useState } from "react";

const StatusBadge = ({ status }) => {
    const map = {
        NEW: { label: "Chờ xác nhận", cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: Clock },
        PACKING: { label: "Chờ gói hàng", cls: "bg-blue-50 text-blue-700 border-blue-200", Icon: Warehouse },
        SHIPPING: { label: "Chờ giao hàng", cls: "bg-cyan-50 text-cyan-700 border-cyan-200", Icon: Truck },
        COMPLETED: { label: "Hoàn thành", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2 },
        CANCELLED: { label: "Đã hủy", cls: "bg-rose-50 text-rose-700 border-rose-200", Icon: XCircle },
    };
    const m = map[status.toUpperCase()] || { label: status, cls: "bg-gray-50 text-gray-700 border-gray-200", Icon: Package };
    const { Icon } = m;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${m.cls}`}>
            <Icon className="h-3.5 w-3.5" />
            {m.label}
        </span>
    );
};

const OrderCard = (props) => {
    const {order} = props;
    const navigate = useNavigate();

    // 🆕 Modal state
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = async () => {
        try {
            setIsCancelling(true);
            // Gọi API hủy đơn hàng
            const res = await postCancelOrder(order.id);
            if(res.success) {
                toast.success(res.message);
                props.fetchOrders?.("");
            } else {
                toast.info(res.message);
            }
        } catch (err) {
            toast.error("Lỗi khi hủy đơn hàng: " + (err?.message || "Không xác định"));
        } finally {
            setIsCancelling(false);
            setShowCancelModal(false);
        }
    };

    const handleRequestCancel = async () => {
        if (!window.confirm("Bạn có muốn gửi yêu cầu hủy đơn hàng này không?")) return;
        try {
            const res = await fetch(`/api/orders/${order.id}/request-cancel`, { // sửa orderId -> order.id
                method: "POST",
            });
            if (!res.ok) throw new Error("Không thể gửi yêu cầu hủy");
            toast.success("Đã gửi yêu cầu hủy đơn hàng thành công!");
        } catch (err) {
            toast.error("Lỗi khi gửi yêu cầu hủy: " + (err?.message || "Không xác định"));
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span className="font-medium text-gray-900">UTE Shop</span>
                    <span className="mx-1 text-gray-300">•</span>
                    <span>Mã đơn: <span className="font-medium">{order.id}</span></span>
                </div>
                <StatusBadge status={order.status} />
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-100">
                {order.items.map((it) => (
                    <div key={it.product.id} className="flex items-center gap-4 px-4 py-3">
                        <img src={it.product.image} alt={it.product.name} className="h-16 w-16 rounded-lg object-cover border" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">{it.product.name}</div>
                            <div className="mt-0.5 text-xs text-gray-500">{`${it.color}, ${it.size}`}</div>
                        </div>
                        <div className="text-sm text-gray-600">x{it.qty}</div>
                        <div className="w-28 text-right text-sm font-semibold text-gray-900">{formatPrice(it?.product.price)}</div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 px-4 py-3 bg-gray-50 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-gray-600">
                    Ngày đặt:{" "}
                    {formatDateTime(order.created_at)}
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="text-sm">Tổng tiền: <span className="font-semibold text-gray-900">{formatPrice(order.total_amount)}</span></div>

                    {order.status.toUpperCase() === "NEW" && (
                        <button
                            onClick={() => setShowCancelModal(true)} // 🆕 mở modal
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                            Hủy đơn hàng
                        </button>
                    )}

                    {(order.status.toUpperCase() === "PACKING" || order.status.toUpperCase() === "SHIPPING") && (
                        <button
                            onClick={() => handleRequestCancel(order.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                            Gửi yêu cầu hủy
                        </button>
                    )}

                    <button
                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => navigate(`/user/order-detail/${order.id}`)}
                    >
                        Xem chi tiết <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* ===================== Modal Xác nhận Hủy ===================== */}
            {showCancelModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    aria-modal="true"
                    role="dialog"
                    aria-labelledby="cancel-title"
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => !isCancelling && setShowCancelModal(false)}
                    />
                    {/* Modal Card */}
                    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h3 id="cancel-title" className="text-base font-semibold text-gray-900">
                                Xác nhận hủy đơn hàng
                            </h3>
                        </div>
                        <div className="px-5 py-4 text-sm text-gray-600">
                            <p className="mb-2">
                                Bạn có chắc chắn muốn hủy đơn <span className="font-medium text-gray-900">#{order.id}</span> không?
                            </p>
                            <p className="text-xs text-gray-500">
                                Lưu ý: Chỉ có thể hủy trong vòng 30 phút sau khi đặt và khi đơn đang ở trạng thái <span className="font-medium">NEW</span>.
                            </p>
                        </div>
                        <div className="px-5 py-4 bg-gray-50 flex items-center justify-end gap-2 rounded-b-2xl">
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={() => setShowCancelModal(false)}
                                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                            >
                                Không, quay lại
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="inline-flex items-center gap-2 rounded-lg border border-rose-600 bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                            >
                                {isCancelling && (
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z"></path>
                                    </svg>
                                )}
                                Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* =================== /Modal Xác nhận Hủy ===================== */}
        </div>
    );
};

export default OrderCard;
