import axios from "../utils/axiosCustomize.jsx"

const getUserVouchers = (page = 1) => {
    return axios.get("api/vouchers/my", {
        params: {
            page, // query param được backend đọc từ req.query.page
        },
    });
};

const addGiftVoucher = async (voucherData) => {
    return axios.post("api/vouchers/gift", {
        name: voucherData.name,
        slug: voucherData.slug,
        description: voucherData.description,
        discount_type: voucherData.discount_type,
        discount_value: voucherData.discount_value,
        max_discount: voucherData.max_discount,
        min_order_value: voucherData.min_order_value,
        usage_limit: 1,
        start_date: voucherData.start_date ?? new Date(),
        end_date: voucherData.end_date ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: voucherData.status ?? "active",
    });
}
export {getUserVouchers, addGiftVoucher}