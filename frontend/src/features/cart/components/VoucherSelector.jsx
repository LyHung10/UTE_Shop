import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
    TicketPercent, ChevronDown, Loader2, Clock, Info, Tag,
} from "lucide-react";
import { createPortal } from "react-dom";
import { getUserVouchers } from "@/services/voucherService.jsx";

const VoucherSelector = (props) => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const totalRef = useRef(null);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);

    const anchorRef = useRef(null);
    const containerRef = useRef(null);

    const [dropdownRect, setDropdownRect] = useState({
        top: 0, left: 0, width: 0, maxHeight: 384,
    });

    const updateDropdownPosition = () => {
        const btn = anchorRef.current;
        if (!btn) return;
        const r = btn.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const desiredMaxHeight = 384;
        const spaceBelow = viewportH - r.bottom - 8;
        const openDown = spaceBelow >= Math.min(desiredMaxHeight, 240);
        const top = openDown ? r.bottom + 8 : Math.max(8, r.top - desiredMaxHeight - 8);
        const maxHeight = openDown ? Math.min(desiredMaxHeight, spaceBelow) : Math.min(desiredMaxHeight, r.top - 8);
        setDropdownRect({ top, left: r.left, width: r.width, maxHeight: Math.max(200, maxHeight) });
    };

    useLayoutEffect(() => {
        if (!isDropdownOpen) return;
        updateDropdownPosition();
        const onResize = () => updateDropdownPosition();
        const onScroll = () => updateDropdownPosition();
        window.addEventListener("resize", onResize);
        window.addEventListener("scroll", onScroll, true);
        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("scroll", onScroll, true);
        };
    }, [isDropdownOpen]);

    // ==== Click-outside: bỏ qua click ngay sau khi mở ====
    const justOpenedRef = useRef(false);
    useEffect(() => {
        if (!isDropdownOpen) return;

        justOpenedRef.current = true;
        const clearFlag = setTimeout(() => { justOpenedRef.current = false; }, 0);

        const onDocPointerDown = (e) => {
            if (justOpenedRef.current) return;
            const anchor = anchorRef.current;
            const drop = containerRef.current?.parentElement?.parentElement;
            const target = e.target;
            if (anchor && anchor.contains(target)) return;
            if (drop && drop.contains(target)) return;
            setIsDropdownOpen(false);
        };

        document.addEventListener("pointerdown", onDocPointerDown, true);
        return () => {
            clearTimeout(clearFlag);
            document.removeEventListener("pointerdown", onDocPointerDown, true);
        };
    }, [isDropdownOpen]);

    useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
    useEffect(() => { loadingRef.current = loading; }, [loading]);

    useEffect(() => {
        if (isDropdownOpen) {
            setPage(1);
            setVouchers([]);
            setHasMore(true);
            hasMoreRef.current = true;
            totalRef.current = null;
            loadVouchers(1);
        }
    }, [isDropdownOpen]);

    useEffect(() => {
        if (page > 1) loadVouchers(page);
    }, [page]);

    const loadVouchers = async (pageNum = 1) => {
        if (!hasMoreRef.current || loadingRef.current) return;
        setLoading(true);
        loadingRef.current = true;
        try {
            const res = await getUserVouchers(pageNum);
            const newVouchers = res?.data || [];
            const total = res?.pagination?.total ?? 0;

            if (totalRef.current == null) totalRef.current = total;

            setVouchers((prev) => {
                const merged = prev.concat(newVouchers);
                const t = totalRef.current ?? total;
                if (t && merged.length >= t) setHasMore(false);
                if (!t && newVouchers.length === 0) setHasMore(false);
                return merged;
            });
        } catch (err) {
            console.error("❌ Failed to load vouchers:", err);
            setHasMore(false);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    };

    const handleScroll = () => {
        const el = containerRef.current;
        if (!el) return;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50 && hasMoreRef.current && !loadingRef.current) {
            setPage((p) => p + 1);
        }
    };

    const handleSelect = (slug) => {
        props.setCouponCode(slug);
        setIsDropdownOpen(false);
    };

    // Dropdown (portal + fixed)
    const dropdown = isDropdownOpen
        ? createPortal(
            <div
                className="fixed z-[9999] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
                style={{ top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="overflow-y-auto overflow-x-hidden"
                    style={{ maxHeight: dropdownRect.maxHeight }}
                >
                    <div className="p-3">
                        {vouchers.length === 0 && !loading && (
                            <div className="text-center py-6 text-gray-500">Không có voucher khả dụng</div>
                        )}

                        {vouchers.map((v) => (
                            <button
                                key={v.id}
                                onClick={() => handleSelect(v.slug)}
                                className={`w-full text-left p-4 rounded-xl border border-gray-100 transition-all mb-2 hover:shadow-md hover:border-indigo-200 bg-white`}
                            >
                                {/* Hàng trên: slug trái – ưu đãi phải (căn thẳng) */}
                                <div className="grid grid-cols-[1fr,auto] items-start gap-2 mb-2">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900 truncate">{v.slug}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{v.description}</p>
                                    </div>
                                </div>

                                {/* Hàng dưới: info 2 cột gọn gàng */}
                                <div className="text-xs text-gray-600 grid grid-cols-2 gap-y-1 gap-x-2">
                                    <div className="flex items-center gap-1">
                                        <Info className="w-3 h-3 text-gray-400 shrink-0" />
                                        <span>
                        Đơn tối thiểu: <strong className="tabular-nums">{Number(v.min_order_value ?? 0).toLocaleString()}đ</strong>
                      </span>
                                    </div>

                                    {v.discount_type === "percent" && v.max_discount && (
                                        <div className="flex items-center gap-1 justify-start sm:justify-end">
                                            <Tag className="w-3 h-3 text-gray-400 shrink-0" />
                                            <span>
                         Giảm tối đa: <strong className="tabular-nums">{Number(v.max_discount ?? 0).toLocaleString()}đ</strong>
                        </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 col-span-2">
                                        <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                                        <span>
                        HSD: <strong>{v.end_date ? new Date(v.end_date).toLocaleDateString("vi-VN") : "--/--/----"}</strong>
                      </span>
                                    </div>
                                </div>
                            </button>
                        ))}

                        {loading && (
                            <div className="flex justify-center items-center py-4 text-indigo-600">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang tải...
                            </div>
                        )}
                    </div>
                </div>
            </div>,
            document.body
        )
        : null;

    return (
        <div className="relative">
            {/* Nút chọn voucher */}
            <button
                ref={anchorRef}
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen((o) => !o);
                }}
                className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white hover:border-indigo-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm hover:shadow-md"
            >
                <div className="flex items-center gap-2 min-w-0">
                    <TicketPercent className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span className="font-medium text-gray-900 truncate">
          {props.statusVoucher === true
              ? (props.couponCode?.trim() || "Chọn mã giảm giá")
              : "Chọn mã giảm giá"}
          </span>
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
            </button>

            {dropdown}
        </div>
    );
};

export default VoucherSelector;
