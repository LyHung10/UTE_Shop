// features/orders/pages/OrderDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Truck, Clock, CheckCircle2, XCircle,
    MapPin, Phone, User as UserIcon, CreditCard,
    MessageSquare, Repeat, Star, PackageCheck, Warehouse
} from "lucide-react";
import EnhancedOrderProgress from "@/features/user/components/EnhancedOrderProgress.jsx";
import { getOrderDetail } from "@/services/orderService.jsx";
import { formatDateTime, formatPrice, normalizeStatus } from "@/utils/format.jsx";

const tax = 40000;
// Map trạng thái -> badge + icon + step index cho progress
const STATUS_MAP = {
    NEW: { key: "PENDING", label: "Mới tạo", icon: Clock, step: 1 },
    CONFIRMED: { key: "PENDING", label: "Đã xác nhận", icon: PackageCheck, step: 2 },
    PACKING: { key: "PENDING", label: "Chuẩn bị hàng", icon: Warehouse, step: 3 },
    SHIPPING: { key: "DELIVERING", label: "Chờ giao hàng", icon: Truck, step: 4 },
    COMPLETED: { key: "COMPLETED", label: "Giao thành công", icon: CheckCircle2, step: 5 },
    CANCELLED: { key: "CANCELLED", label: "Đã hủy", icon: XCircle, step: 0 }
};

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    // Chuẩn hoá response {order, address, items} -> shape cũ UI đang dùng
    const normalize = (payload) => {
        const o = payload?.order || {};
        const addrText = payload?.address?.text || "";
        const addrDetail = payload?.address?.detail || {};
        const items = Array.isArray(payload?.items) ? payload.items : [];

        // shipping_fee phía server không trả → fallback 0 (hoặc lấy từ order.shipping_fee nếu có)
        const shipping_fee = Number(o?.shipping_fee ?? 0);

        // “discount” phía server là tiền giảm do voucher đã tính
        const voucher_discount = Number(o?.discount ?? 0);
        const discount = 0; // giữ field discount cho UI cũ (nếu sau này có các giảm giá khác)

        return {
            id: o.id,
            status: o.status,
            created_at: o.created_at,
            updated_at: o.updated_at,
            total_amount: Number(o.total_amount ?? 0),

            // địa chỉ hiển thị & người nhận (map sang các field UI cũ đang dùng)
            receiver_name: addrDetail?.name_order || null,
            receiver_phone: addrDetail?.phone_order || null,
            shipping_address: addrText || null,

            // phí/giảm
            shipping_fee,
            discount,                // giữ field cũ
            voucher_discount,        // hiển thị “Voucher từ shop”
            voucher_id: o?.voucher_id ?? null,

            // thanh toán
            payment_method: o?.payment_method || null,
            payment_status: o?.payment_status || null,

            // items
            items
        };
    };

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setErr("");
                const res = await getOrderDetail(id);
                // service trả: { success, message, data: { order, address, items } }
                const normalized = normalize(res?.data || null);
                setData(normalized);
            } catch (e) {
                if (e.name !== "CanceledError")
                    setErr(e?.response?.data?.error || e.message);
            } finally {
                setLoading(false);
            }
        })();
        return () => controller.abort();
    }, [id]);

    if (loading) return <div>Đang tải...</div>;
    if (err) return <div className="text-red-500">{err}</div>;
    if (!data) return <div>Không tìm thấy đơn hàng</div>;

    const s = data.status.toUpperCase();
    const statusMeta = STATUS_MAP[s] || STATUS_MAP.NEW;
    const StatusIcon = statusMeta.icon;

    const subtotal = data.items?.reduce(
        (sum, it) => sum + Number(it.price) * Number(it.qty),
        0
    );

    const shipping = Number(data.shipping_fee || 0);

    // discount “khác” (giữ field theo UI cũ) → hiện tại = 0
    const discount = Number(data.discount || 0);

    // voucher từ shop = order.discount của server
    const voucher = Number(data.voucher_discount || 0);

    // tổng tiền: ưu tiên server; nếu thiếu thì tự tính
    const computedGrand = (subtotal + shipping - discount - voucher);
    const grandTotal = Number.isFinite(Number(data.total_amount))
        ? Number(data.total_amount)
        : computedGrand;

    // flag để luôn hiển thị voucher nếu có voucher_id dù giá trị = 0
    const shouldShowVoucherLine = (data.voucher_id != null) || voucher > 0;

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-base font-semibold text-gray-900">
                        Chi tiết đơn hàng
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="text-gray-600">
                            Mã đơn:{" "}
                            <span className="font-semibold text-gray-900">#{data.id}</span>
                        </div>
                        <div
                            className={[
                                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
                                s === "CANCELLED"
                                    ? "border-rose-200 bg-rose-50 text-rose-700"
                                    : "border-indigo-200 bg-indigo-50 text-indigo-700"
                            ].join(" ")}
                        >
                            <StatusIcon className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">{statusMeta.label}</span>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="mt-4">
                    <EnhancedOrderProgress
                        status={data.status}
                        currentStep={statusMeta.step}
                        timeline={{
                            placedAt: data.created_at,
                            cancelAt: data.updated_at,
                        }}
                    />
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2 md:justify-end">
                    {(s === "DELIVERED" || s === "COMPLETED") && (
                        <button
                            onClick={() => navigate(`/user/orders/${data.id}/review`)}  // Thêm /user/ prefix
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-amber-600">
                            <Star className="h-4 w-4" /> Đánh giá
                        </button>
                    )}
                    <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                        <MessageSquare className="h-4 w-4" /> Liên hệ người bán
                    </button>
                    {/*{data.status === "COMPLETED" && (*/}
                    {/*    <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700">*/}
                    {/*    <Repeat className="h-4 w-4" /> Mua lại*/}
                    {/*    </button>*/}
                    {/*)}*/}
                </div>
            </div>

            {/* Địa chỉ nhận hàng */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="mb-3 text-sm font-semibold text-gray-900">
                    Địa chỉ nhận hàng
                </div>
                <div className="grid gap-2 text-sm text-gray-700 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{data.receiver_name || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{data.receiver_phone || "—"}</span>
                    </div>
                    <div className="md:col-span-2 flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
                        <span>{data.shipping_address || "—"}</span>
                    </div>
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {data.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-4 px-4 py-3">
                            <img
                                src={it.product?.image}
                                alt={it.product?.name}
                                className="h-16 w-16 rounded-lg object-cover border"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                    {it.product?.name || "Sản phẩm"}
                                </div>
                                <div className="mt-0.5 text-xs text-gray-500">
                                    {[it.color, it.size].filter(Boolean).join(" / ")}
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">x{it.qty}</div>
                            <div className="w-28 text-right text-sm font-semibold text-gray-900">
                                {formatPrice(it.price)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chi phí & thanh toán */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="mb-3 text-sm font-semibold text-gray-900">
                    Chi tiết thanh toán
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tổng tiền hàng</span>
                        <span className="font-medium text-gray-900">
                            {formatPrice(subtotal)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Thuế</span>
                        <span className="font-medium text-gray-900">
                            {formatPrice(tax)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Phí vận chuyển</span>
                        <span className="font-medium text-gray-900">
                            {formatPrice(grandTotal - tax - discount - subtotal)}
                        </span>
                    </div>

                    {discount > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Giảm giá</span>
                            <span className="font-medium text-emerald-700">
                                - {formatPrice(discount)}
                            </span>
                        </div>
                    )}

                    {/* Luôn hiển thị “Voucher từ shop” khi có voucher_id, kể cả số tiền 0 */}
                    {shouldShowVoucherLine && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Voucher</span>
                            <span className="font-medium text-emerald-700">
                                - {formatPrice(voucher)}
                            </span>
                        </div>
                    )}

                    <div className="my-2 h-px bg-gray-100" />

                    <div className="flex items-center justify-between text-base">
                        <span className="font-semibold text-gray-900">Thành tiền</span>
                        <span className="font-bold text-indigo-700">
                            {formatPrice(grandTotal)}
                        </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-gray-600">
                            <CreditCard className="h-4 w-4" /> Phương thức thanh toán
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                            {data.payment_method || "—"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer meta */}
            <div className="text-xs text-gray-500 text-right">
                Ngày đặt: {formatDateTime(data.created_at)}{" "}
                <span className="mx-1 text-gray-300">•</span>
            </div>
        </div>
    );
}
