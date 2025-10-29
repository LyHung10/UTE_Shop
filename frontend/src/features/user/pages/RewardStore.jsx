import React, { useState } from "react";
import { Gift, TicketPercent, Loader2, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addGiftVoucher } from "@/services/voucherService.jsx";
import { fetchUser } from "@/redux/action/userAction.jsx";

const GIFT_VOUCHERS = [
    {
        name: "Giảm 10% cho đơn từ 200k",
        slug: "DISCOUNT10",
        description: "Áp dụng cho tất cả sản phẩm, tối đa 30.000đ",
        discount_type: "percent",
        discount_value: 10,
        max_discount: 30000,
        min_order_value: 200000,
        points_required: 30000,
        image: "https://cdn-icons-png.flaticon.com/512/891/891462.png",
    },
    {
        name: "Giảm 20k cho đơn từ 100k",
        slug: "SAVE20K",
        description: "Voucher giảm trực tiếp 20.000đ cho đơn tối thiểu 100k",
        discount_type: "fixed",
        discount_value: 20000,
        max_discount: null,
        min_order_value: 100000,
        points_required: 16000,
        image: "https://cdn-icons-png.flaticon.com/512/891/891462.png",
    },
    {
        name: "Giảm 15% đồ thời trang",
        slug: "FASHION15",
        description: "Áp dụng cho sản phẩm thời trang",
        discount_type: "percent",
        discount_value: 15,
        max_discount: 50000,
        min_order_value: 300000,
        points_required: 12000,
        image: "https://cdn-icons-png.flaticon.com/512/891/891462.png",
    },
    {
        name: "Giảm 50k đơn từ 500k",
        slug: "SAVE50K",
        description: "Tặng ngay 50.000đ cho đơn hàng từ 500k",
        discount_type: "fixed",
        discount_value: 50000,
        max_discount: null,
        min_order_value: 500000,
        points_required: 50000,
        image: "https://cdn-icons-png.flaticon.com/512/891/891462.png",
    },
    {
        name: "Giảm 25% phụ kiện",
        slug: "ACCESS25",
        description: "Áp dụng cho danh mục phụ kiện",
        discount_type: "percent",
        discount_value: 25,
        max_discount: 70000,
        min_order_value: 200000,
        points_required: 20000,
        image: "https://cdn-icons-png.flaticon.com/512/891/891462.png",
    },
    {
        name: "Giảm 100k cho đơn 1tr",
        slug: "BIGSALE100",
        description: "Giảm 100.000đ cho đơn hàng từ 1.000.000đ",
        discount_type: "fixed",
        discount_value: 100000,
        max_discount: null,
        min_order_value: 1000000,
        points_required: 18000,
        image: "https://cdn-icons-png.flaticon.com/512/891/891462.png",
    },
    {
        name: "Giảm 5% toàn shop",
        slug: "SHOP5",
        description: "Áp dụng toàn shop, không giới hạn sản phẩm",
        discount_type: "percent",
        discount_value: 5,
        max_discount: 20000,
        min_order_value: 0,
        points_required: 15000,
        image: "https://cdn-icons-png.flaticon.com/512/891/891462.png",
    },
    {
        name: "Tặng voucher sinh nhật",
        slug: "BDAY30",
        description: "Giảm 30% cho khách hàng sinh nhật trong tháng này",
        discount_type: "percent",
        discount_value: 30,
        max_discount: 100000,
        min_order_value: 200000,
        points_required: 10000,
        image: "https://cdn-icons-png.flaticon.com/512/891/891462.png",
    },
    {
        name: "Giảm 70k đơn từ 700k",
        slug: "SAVE70",
        description: "Giảm 70.000đ cho đơn hàng từ 700.000đ",
        discount_type: "fixed",
        discount_value: 70000,
        max_discount: null,
        min_order_value: 700000,
        points_required: 50000,
        image: "https://cdn-icons-png.flaticon.com/512/891/891462.png",
    },
];

const RewardStore = () => {
    const user = useSelector((state) => state.user);
    const authStatus = useSelector((state) => state.authStatus);
    const dispatch = useDispatch();
    const [loadingSlug, setLoadingSlug] = useState(null);

    const handleRedeem = async (voucher) => {
        const now = new Date();
        const user_slug =
            voucher.slug +
            authStatus.id +
            now.getDate().toString().padStart(2, '0') +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getFullYear().toString().slice(-2);

        if (user?.loyalty_points < voucher.points_required) {
            toast.warning("Bạn chưa đủ điểm để đổi voucher này!");
            return;
        }

        setLoadingSlug(voucher.slug);

        const payload = {
            name: voucher.name,
            slug: user_slug,
            description: voucher.description,
            discount_type: voucher.discount_type,
            discount_value: voucher.discount_value,
            max_discount: voucher.max_discount,
            min_order_value: voucher.min_order_value,
            status: "active",
            image: voucher.image,
            point: voucher.points_required
        };

        try {
            const res = await addGiftVoucher(payload);
            if (res.success) {
                toast.success(`🎉 Đổi thành công voucher`);
                dispatch(fetchUser());
            }
            else {
                toast.info(res.message);
            }
        } catch (err) {
            console.error(err);
            toast.error("❌ Đổi voucher thất bại, vui lòng thử lại!");
        } finally {
            setLoadingSlug(null);
        }
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
            <div className="max-w-6xl my-10 mx-auto px-6 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl">
                            <Gift className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Trung tâm đổi điểm thưởng
                        </h1>
                    </div>

                    <div className="text-right">
                        <div className="text-sm text-gray-600">Điểm hiện tại</div>
                        <div className="text-2xl font-bold text-indigo-600 flex items-center justify-end gap-1">
                            <Star className="w-5 h-5 text-amber-400" />
                            {user?.loyalty_points} điểm
                        </div>
                    </div>
                </div>

                {/* Grid vouchers */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {GIFT_VOUCHERS.map((v) => {
                        const canRedeem = user?.loyalty_points >= v.points_required;
                        const loading = loadingSlug === v.slug;

                        return (
                            <div
                                key={v.slug}
                                className="bg-white/90 backdrop-blur-lg border border-white/30 rounded-2xl shadow-sm hover:shadow-lg transition-all p-5 flex flex-col"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <img
                                        src={v.image}
                                        alt={v.name}
                                        className="w-14 h-14 rounded-xl object-contain bg-gray-50 border"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{v.name}</h3>
                                        <p className="text-xs text-gray-500">{v.slug}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 flex-1">{v.description}</p>

                                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                                    <span>Tối thiểu: {v.min_order_value.toLocaleString()}đ</span>
                                    <span className="text-indigo-600 font-semibold">
                                        {v.discount_type === "percent"
                                            ? `-${v.discount_value}%`
                                            : `-${v.discount_value.toLocaleString()}đ`}
                                    </span>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Cần{" "}
                                        <span className="font-bold text-indigo-600">
                                            {v.points_required}
                                        </span>{" "}
                                        điểm
                                    </div>

                                    <button
                                        onClick={() => handleRedeem(v)}
                                        disabled={!canRedeem || loading}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm ${canRedeem
                                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-md"
                                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <TicketPercent className="w-4 h-4" />
                                        )}
                                        {loading
                                            ? "Đang đổi..."
                                            : canRedeem
                                                ? "Đổi ngay"
                                                : "Chưa đủ"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RewardStore;
