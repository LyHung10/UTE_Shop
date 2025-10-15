import PageMeta from "@/admin/components/common/PageMeta.jsx";
import PageBreadcrumb from "@/admin/components/common/PageBreadCrumb.jsx";
import OrderDataTable from "@/admin/components/tables/OrderDataTable.jsx";
import { useEffect, useState } from "react";
import { message, Modal } from "antd";
import {
    getAdminDetailOrder,
    getAllOrders, postCancelAdminOrder, putConfirmOrder, putConfirmOrderComplete, putShippingOrder,
} from "@/services/adminService.jsx";
import {toast} from "react-toastify";
import {formatDateTime, formatPrice} from "@/utils/format.jsx";
import {MapPin, Phone, UserIcon} from "lucide-react";

const Orders = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal xem nhanh (optional)
    const [preview, setPreview] = useState({ open: false, record: null });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getAllOrders();
            // API của bạn log ra: { data: [ ... ] }
            const list = res?.data?.data ?? res?.data ?? [];
            setData(list);
        } catch (e) {
            console.error(e);
            message.error("Không tải được danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handler: xem thông tin
    const handleViewInfo = async (record) => {
        const detailOrder = await getAdminDetailOrder(record.orderId);
        if (detailOrder.success)
        {
            setPreview({ open: true, record: detailOrder.data});
        }
    };

    // Handler: xác nhận đơn (áp dụng cho NEW/PENDING)
    const handleConfirmPackingOrder = async (record) => {
        try {
            const res = await putConfirmOrder(record.orderId);
            if (res.success === true) toast.success(res.message);
            if (res.success === false) toast.info(res.message);
            fetchData();
        } catch (e) {
            console.error(e);
            message.error("Xác nhận không thành công");
        }
    };

    // Handler: đổi trạng thái (áp dụng cho trạng thái khác ngoài COMPLETED/PENDING)
    const handleConfirmShippingOrder = async (record) => {
        try {
            const res = await putShippingOrder(record.orderId);
            if (res.success === true) toast.success(res.message);
            if (res.success === false) toast.info(res.message);
            fetchData();
        } catch (e) {
            console.error(e);
            message.error("Chuyển trạng thái không thành công");
        }
    };
    const handleCompleteOrder = async (record) =>
    {
        try {
            const res = await putConfirmOrderComplete(record.orderId);
            if (res.success === true) toast.success(res.message);
            if (res.success === false) toast.info(res.message);
            fetchData();
        } catch (e) {
            console.error(e);
            message.error("Chuyển trạng thái không thành công");
        }
    }
    // Handler: xoá đơn
    const handleCancel = async (record) => {
        try {
            const res = await postCancelAdminOrder(record.orderId);
            if (res.success === true) toast.success(res.message);
            if (res.success === false) toast.info(res.message);
            fetchData();
        } catch (e) {
            console.error(e);
            message.error("Xoá không thành công");
        }
    };
    const subtotal = preview?.record?.items?.reduce(
        (sum, it) => sum + Number(it.price) * Number(it.qty),
        0
    );
    const grandTotal = preview?.record?.order?.total_amount;
    const voucher = preview?.record?.order?.discount;
    const tax = 40000;
    console.log(preview);
    return (
        <>
            <PageMeta title="Admin UTE Shop | Manage Orders" />
            <PageBreadcrumb pageTitle="Manage Orders" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="space-y-6">
                    <OrderDataTable
                        data={data}
                        loading={loading}
                        onViewInfo={handleViewInfo}
                        onConfirmPacking={handleConfirmPackingOrder}
                        onConfirmShippingOrder={handleConfirmShippingOrder}
                        onConfirmCompletedOrder={handleCompleteOrder}
                        onCancel={handleCancel}
                    />
                </div>
            </div>

            {/* Modal xem nhanh */}
            <Modal
                title={null}
                open={preview.open}
                onCancel={() => setPreview({ open: false, record: null })}
                footer={null}
                width={750}
                styles={{ body: { padding: 0 } }}
            >
                {preview.record && (
                    <div className="p-6 space-y-5 rounded-xl">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Chi tiết đơn hàng
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Mã đơn: <b>#{preview?.record?.order?.id}</b>
                                </p>
                            </div>
                        </div>

                        {/* Khách hàng & địa chỉ */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="mb-3 text-sm font-semibold text-gray-900">
                                Thông tin khách hàng
                            </div>
                            <div className="grid gap-2 text-sm text-gray-700 md:grid-cols-2">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">{preview.record.address.detail.name_order || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span>{preview.record.address.detail.phone_order || "—"}</span>
                                </div>
                                <div className="md:col-span-2 flex items-start gap-2">
                                    <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
                                    <span>{preview.record.address.text || "—"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Danh sách sản phẩm */}
                        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {Array.isArray(preview.record.items) && preview.record.items.length > 0 ? (
                                    preview.record.items.map((it, idx) => (
                                        <div key={idx} className="flex items-center gap-4 px-4 py-3">
                                            <img
                                                src={it?.product?.image}
                                                alt={it?.product?.name || "Sản phẩm"}
                                                className="h-14 w-14 rounded-lg object-cover border"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {it?.product?.name || "Sản phẩm"}
                                                </div>
                                                <div className="mt-0.5 text-xs text-gray-500">
                                                    {[it?.color, it?.size].filter(Boolean).join(" / ")}
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-600">x{Number(it?.qty || 0)}</div>

                                            <div className="w-28 text-right text-sm font-semibold text-gray-900">
                                                {formatPrice(Number(it?.price || 0))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500">Không có sản phẩm</div>
                                )}
                            </div>
                        </div>

                        {/* Tổng tiền + trạng thái */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="text-sm font-semibold mb-3 text-gray-900">Chi tiết thanh toán</div>
                            <div className="flex items-center justify-between text-sm text-gray-700">
                                <span>Tổng tiền hàng</span>
                                <b className="text-gray-900">
                                    {formatPrice(subtotal)}
                                </b>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-700">
                                <span>Thuế</span>
                                <b className="text-gray-900">
                                    {formatPrice(tax)}
                                </b>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-700">
                                <span>Phí vận chuyển</span>
                                <b className="text-gray-900">
                                    {formatPrice(grandTotal - tax + voucher - subtotal)}
                                </b>
                            </div>
                            {voucher > 0 && (
                                <div className="flex items-center justify-between text-sm text-gray-700">
                                    <span>Voucher</span>
                                    <b className="text-gray-900">
                                        -{formatPrice(voucher)}
                                    </b>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm text-gray-700">
                                <span>Thành tiền</span>
                                <b className="text-gray-900">
                                    {formatPrice(grandTotal)}
                                </b>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-2">
                                <span>Phương thức</span>
                                <b>{preview.record.order.payment_method || "COD"}</b>
                            </div>
                        </div>

                        {/* Footer meta */}
                        <div className="text-xs text-gray-500 text-right">
                            Ngày đặt: {formatDateTime(preview.record.order.created_at)}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default Orders;
