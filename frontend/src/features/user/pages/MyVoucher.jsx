import React, { useEffect, useState } from "react";
import { Gift, TicketPercent, Calendar } from "lucide-react";
import { Pagination } from "antd";
import { getUserVouchers } from "@/services/voucherService.jsx";

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

const MyVoucher = () => {
    const [loading, setLoading] = useState(false);
    const [vouchers, setVouchers] = useState([]);
    const [err, setErr] = useState("");
    const [pageInfo, setPageInfo] = useState({ page: 1, page_size: 10, total: 0 });

    const loadVouchers = async (pageNum = 1) => {
        try {
            setLoading(true);
            setErr("");
            const res = await getUserVouchers(pageNum);
            const p = res?.pagination || {};
            setVouchers(Array.isArray(res?.data) ? res.data : []);
            setPageInfo({
                page: p.page ?? pageNum,
                page_size: p.page_size ?? 10,
                total: p.total ?? (Array.isArray(res?.data) ? res.data.length : 0),
            });
        } catch (e) {
            setErr(e?.response?.data?.error || e.message || "Không thể tải voucher");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVouchers(1);
    }, []);

    return (
        <div className="w-full bg-gray-50">
            <div className="max-w-6xl my-10 mx-auto px-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                            <TicketPercent className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-lg font-semibold text-gray-900">Voucher của tôi</h1>
                    </div>
                </div>

                {/* State messages */}
                {loading && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center text-gray-500 text-sm">
                        Đang tải...
                    </div>
                )}
                {err && !loading && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-rose-700 text-sm">
                        {err}
                    </div>
                )}
                {!loading && !err && vouchers.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500 text-sm">
                        Chưa có voucher nào.
                    </div>
                )}

                {/* Grid vouchers */}
                {!loading && !err && vouchers.length > 0 && (
                    <>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {vouchers.map((v) => {
                                const isPercent = v.discount_type === "percent";
                                const benefit = isPercent
                                    ? `-${v.discount_value}%`
                                    : `-${(v.discount_value || 0).toLocaleString()}đ`;
                                return (
                                    <div
                                        key={v.id}
                                        className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2 hover:shadow-sm transition-shadow"
                                    >
                                        {/* Hàng 1: mã + mức giảm */}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-indigo-50 border border-indigo-100">
                                                    <TicketPercent className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <div className="font-mono text-sm font-semibold text-gray-900">
                                                    {v.slug}
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium text-indigo-600">{benefit}</span>
                                        </div>

                                        {/* Dòng mô tả thêm */}
                                        <p className="text-xs text-gray-600 line-clamp-2">{v.description}</p>

                                        {/* Hạn sử dụng */}
                                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span>HSD: {formatDate(v.end_date)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col items-center gap-1 mt-2">
                            <Pagination
                                size="small"
                                current={pageInfo.page}
                                total={pageInfo.total}
                                pageSize={pageInfo.page_size}
                                showSizeChanger={false}
                                onChange={(page) => {
                                    loadVouchers(page);
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
                                                    padding: "0 6px",
                                                    lineHeight: "22px",
                                                    cursor: "pointer",
                                                    fontSize: 12,
                                                }}
                                            >
                                                {page}
                                            </div>
                                        );
                                    }
                                    return originalElement;
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyVoucher;
