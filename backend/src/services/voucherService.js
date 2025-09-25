import {Voucher} from "../models/index.js";

class VoucherService {
    async createVoucher(voucherData) {
        // 1. Tạo voucher
        const voucher = await Voucher.create(voucherData);

        // 2. Trả về voucher vừa tạo
        return await Voucher.findByPk(voucher.id);
    }

    async validateVoucher(voucherCode, orderTotal, transaction) {
        // Tìm voucher còn active
        const voucher = await Voucher.findOne({
            where: { slug: voucherCode, status: 'active' },
            transaction,
            lock: transaction ? transaction.LOCK.UPDATE : undefined // nếu muốn dùng transaction an toàn
        });

        if (!voucher) {
            return { valid: false, message: 'Voucher không tồn tại hoặc đã hết hạn' };
        }

        const now = new Date();
        if (now < voucher.start_date || now > voucher.end_date) {
            return { valid: false, message: 'Voucher đã hết hạn' };
        }

        if (voucher.min_order_value && orderTotal < voucher.min_order_value) {
            return { valid: false, message: `Đơn hàng phải tối thiểu ${voucher.min_order_value}` };
        }

        // Kiểm tra số lượng voucher
        if (voucher.usage_limit <= 0) {
            return { valid: false, message: 'Voucher đã hết lượt sử dụng' };
        }

        // Tính discount
        let discount = 0;
        if (voucher.discount_type === 'percent') {
            discount = (orderTotal * voucher.discount_value) / 100;
            if (voucher.max_discount && discount > voucher.max_discount) {
                discount = voucher.max_discount;
            }
        } else if (voucher.discount_type === 'fixed') {
            discount = voucher.discount_value;
        }

        return { valid: true, voucher, discount };
    }
}

export default new VoucherService();
