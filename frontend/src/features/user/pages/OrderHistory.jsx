import { useEffect, useState } from "react";
import { Search, Package, Truck, Clock, CheckCircle2, XCircle } from "lucide-react";
import OrderCard from "@/features/user/components/OrderCard.jsx";
import { getUserOrders } from "@/services/orderService.jsx";

const TABS = [
    { key: "", label: "Tất cả", icon: Package },
    { key: "PENDING", label: "Chờ xác nhận", icon: Clock },
    { key: "SHIPPING", label: "Vận chuyển", icon: Truck },
    { key: "OUT_FOR_DELIVERY", label: "Chờ giao hàng", icon: Truck },
    { key: "COMPLETED", label: "Hoàn thành", icon: CheckCircle2 },
    { key: "CANCELLED", label: "Đã hủy", icon: XCircle },
];

const OrderHistory = () => {
    const [activeTab, setActiveTab] = useState("");
    const [q, setQ] = useState("");
    const [orders, setOrders] = useState([]);
    const [pageInfo, setPageInfo] = useState({ page: 1, page_size: 10, total: 0 });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const fetchOrders = async (status) => {
        try {
            setLoading(true);
            setErr("");
            const res = await getUserOrders(status);
            setOrders(res?.data);
            setPageInfo({
                page: res?.page,
                page_size: res?.page_size,
                total: res?.total,
            });
        } catch (e) {
            setErr(e?.response?.data?.error || e.message || "Lỗi tải đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(activeTab);
    }, [activeTab]);

    const filtered = q.trim()
        ? orders.filter(
            (o) =>
                String(o.id).toLowerCase().includes(q.toLowerCase()) ||
                o.items.some((it) => it.product?.name?.toLowerCase().includes(q.toLowerCase()))
        )
        : orders;

    return (
        <div className="flex flex-col gap-4">
            {/* Tabs */}
            <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
                <div className="grid grid-cols-6">
                    {TABS.map(({ key, label, icon: Icon }) => {
                        const active = activeTab === key;
                        return (
                            <button
                                key={key}
                                onClick={() => {
                                    setActiveTab(key);
                                    setPageInfo((p) => ({ ...p, page: 1 }));
                                }}
                                className={[
                                    "flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
                                    active ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100",
                                ].join(" ")}
                            >
                                <Icon className="h-4.5 w-4.5" />
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Search */}
            <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        type="text"
                        placeholder="Tìm theo mã đơn, sản phẩm..."
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                </div>
            </div>

            {/* Orders list */}
            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-500">
                        Đang tải...
                    </div>
                ) : err ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
                        Lỗi: {err}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                        Không tìm thấy đơn hàng phù hợp.
                    </div>
                ) : (
                    filtered.map((order) => <OrderCard key={order.id} order={order} />)
                )}
            </div>

            {/* Pagination info */}
            <div className="text-xs text-gray-500 text-center">
                Tổng: {pageInfo.total} đơn • Trang {pageInfo.page} (size {pageInfo.page_size})
            </div>
        </div>
    );
};

export default OrderHistory;
