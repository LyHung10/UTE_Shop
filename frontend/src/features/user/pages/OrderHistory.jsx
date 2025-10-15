import { useEffect, useState } from "react";
import { Search, Package, Truck, Clock, CheckCircle2, XCircle, Warehouse } from "lucide-react";
import { Pagination } from "antd";
import OrderCard from "@/features/user/components/OrderCard.jsx";
import { getUserOrders } from "@/services/orderService.jsx";

const TABS = [
    { key: "", label: "Tất cả", icon: Package },
    { key: "NEW", label: "Chờ xác nhận", icon: Clock },
    { key: "PACKING", label: "Chuẩn bị hàng", icon: Warehouse },
    { key: "SHIPPING", label: "Chờ giao hàng", icon: Truck },
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

    // Chuẩn hoá dữ liệu API mới -> shape cũ để UI cũ dùng lại
    const normalizeOrders = (apiData = []) =>
        apiData.map((d) => ({
            id: d?.order?.id,
            status: d?.order?.status,
            created_at: d?.order?.created_at,
            updated_at: d?.order?.updated_at,
            total_amount: d?.order?.total_amount,
            address: d?.address || null,
            discount: Number(d?.discount ?? 0),
            items: Array.isArray(d?.items) ? d.items : [],
        }));

    // === GỌI API THEO STATUS + PAGE (server-side pagination) ===
    const fetchOrders = async (status, page) => {
        try {
            setLoading(true);
            setErr("");

            // gọi API truyền status + page (giống ProductCategories đang truyền currentPage)
            const res = await getUserOrders(status, page);

            const list = normalizeOrders(res?.data);
            const p = res?.pagination || {};

            // cập nhật pageInfo từ backend
            setPageInfo({
                page: p.page ?? page ?? 1,
                page_size: p.page_size ?? 10,
                total: p.total ?? (Array.isArray(list) ? list.length : 0),
            });

            setOrders(list);
        } catch (e) {
            setErr(e?.response?.data?.error || e.message || "Lỗi tải đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    // Khi đổi tab → về trang 1 và gọi API
    useEffect(() => {
        setPageInfo((prev) => ({ ...prev, page: 1 }));
        // gọi ngay với page=1
        fetchOrders(activeTab, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Khi đổi trang → gọi lại API (giống ProductCategories)
    useEffect(() => {
        fetchOrders(activeTab, pageInfo.page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageInfo.page]);

    // Tìm kiếm client-side (giữ nguyên)
    const filtered = q.trim()
        ? orders.filter(
            (o) =>
                String(o.id).toLowerCase().includes(q.toLowerCase()) ||
                o.items.some((it) => it.product?.name?.toLowerCase().includes(q.toLowerCase()))
        )
        : orders;

    // Lọc bỏ order rỗng (giữ nguyên logic cũ)
    const cleaned = filtered
        .map((order) => ({ ...order }))
        .filter((order) => order.items.length > 0);

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
                        onChange={(e) => {
                            setQ(e.target.value);
                            // Khi tìm kiếm mới, về trang 1 + gọi lại API trang 1
                            setPageInfo((p) => ({ ...p, page: 1 }));
                            fetchOrders(activeTab, 1);
                        }}
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
                ) : cleaned.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                        Không có đơn hàng nào cần xử lí.
                    </div>
                ) : (
                    cleaned.map((order) => (
                        <OrderCard key={order.id} order={order} fetchOrders={fetchOrders} />
                    ))
                )}
            </div>

            {/* Pagination bar + info */}
            <div className="flex flex-col items-center gap-2">
                <Pagination
                    current={pageInfo.page}
                    total={pageInfo.total}
                    pageSize={pageInfo.page_size}
                    showQuickJumper
                    showSizeChanger={false}
                    onChange={(page) => {
                        setPageInfo((p) => ({ ...p, page }))
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    itemRender={(page, type, originalElement) => {
                        if (type === "page") {
                            return (
                                <div
                                    style={{
                                        border: pageInfo.page === page ? "1px solid #000" : "1px solid #d9d9d9",
                                        color: pageInfo.page === page ? "#000" : "#666",
                                        borderRadius: 6,
                                        padding: "0 8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    {page}
                                </div>
                            );
                        }
                        return originalElement;
                    }}
                />
                <div className="text-xs text-gray-500">
                    Tổng: {pageInfo.total} đơn • Trang {pageInfo.page} (size {pageInfo.page_size})
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
