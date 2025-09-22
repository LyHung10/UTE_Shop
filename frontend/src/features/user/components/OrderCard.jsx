import { CheckCircle2, ChevronRight, Clock, Package, Truck, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {formatDateTime, formatPrice, normalizeStatus} from "@/utils/format.jsx";
import {useNavigate} from "react-router-dom";



const  StatusBadge = ({ status }) => {
    const map = {
        PENDING: { label: "Chờ xác nhận", cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: Clock },
        SHIPPING: { label: "Vận chuyển", cls: "bg-blue-50 text-blue-700 border-blue-200", Icon: Truck },
        OUT_FOR_DELIVERY: { label: "Chờ giao hàng", cls: "bg-cyan-50 text-cyan-700 border-cyan-200", Icon: Truck },
        COMPLETED: { label: "Hoàn thành", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2 },
        CANCELLED: { label: "Đã hủy", cls: "bg-rose-50 text-rose-700 border-rose-200", Icon: XCircle },
    };
    const m = map[normalizeStatus(status)] || { label: status, cls: "bg-gray-50 text-gray-700 border-gray-200", Icon: Package };
    const { Icon } = m;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${m.cls}`}>
            <Icon className="h-3.5 w-3.5" />
            {m.label}
        </span>
    );
}

const OrderCard = (props) => {
    const {order} = props;
    const navigate = useNavigate();

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
                    <button className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            onClick={()=>navigate(`/user/order-detail/${order.id}`)}>
                        Xem chi tiết <ChevronRight className="h-4 w-4" />
                    </button>

                    {order.status === "COMPLETED" &&
                        order.items
                            .filter(it => it.status !== "COMMENTED") // chỉ lấy sản phẩm chưa comment
                            .map((it) => (
                                <Link
                                    key={it.product.id}
                                    to={`/review?orderId=${order.id}&productId=${it.product.id}`}
                                >
                                    <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                        Đánh giá
                                    </button>
                                </Link>
                            ))
                    }   
                </div>
            </div>
        </div>
    );
}
export default OrderCard;