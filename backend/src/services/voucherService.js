import {Voucher} from "../models/index.js";
import { Sequelize } from "sequelize"; // ✅ thêm dòng này

class VoucherService {
    async createVoucher(voucherData) {
        // 1. Tạo voucher
        const voucher = await Voucher.create(voucherData);

        // 2. Trả về voucher vừa tạo
        const newVoucher =  await Voucher.findByPk(voucher.id);
        if (newVoucher)
        {
            if (newVoucher.userId)
            {
                return {
                    success: true,
                    message: "Đổi voucher thành công"
                }
            }
            else
            {
                return {
                    success: true,
                    message: "Tạo voucher thành công"
                }
            }
        }
        else
        {
            return {
                success: false,
                message: "Tạo voucher thất bại"
            }
        }
    }

    async validateVoucher(voucherCode, orderTotal, transaction) {
        const lockOption =
            transaction && transaction.LOCK
                ? Sequelize.Transaction.LOCK.UPDATE
                : undefined;

        const voucher = await Voucher.findOne({
            where: { slug: voucherCode, status: 'active' },
            transaction: transaction && transaction.commit ? transaction : undefined,
            lock: lockOption,
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

    async getUserVouchers(userId, options = {}) {
        const {
            page = 1,
            pageSize = 10,
            sort = "-created_at",   // 'created_at' | '-created_at'
            onlyActive = true       // true -> chỉ lấy active trong khung thời gian hiệu lực
        } = options;

        const pageNum = Math.max(1, Number(page) || 1);
        const pageSizeNum = Math.max(1, Number(pageSize) || 5);
        const offset = (pageNum - 1) * pageSizeNum;

        // ORDER BY
        const orderBy = sort === "created_at" ? "created_at ASC" : "created_at DESC";

        // WHERE: chỉ public (user_id IS NULL) hoặc của chính user
        const baseScope = "(user_id IS NULL OR user_id = :userId)";
        const activeClause = onlyActive
            ? " AND status = 'active' AND start_date <= NOW() AND end_date >= NOW()"
            : "";
        const whereSql = `${baseScope}${activeClause}`;

        // Đếm tổng
        const countRows = await Voucher.sequelize.query(
            `SELECT COUNT(*) AS total FROM vouchers WHERE ${whereSql}`,
            {
                replacements: { userId },
                type: Voucher.sequelize.QueryTypes.SELECT,
            }
        );
        const total = Number((countRows?.[0]?.total) || 0);

        // Lấy dữ liệu trang
        const rows = await Voucher.sequelize.query(
            `
      SELECT
        id, user_id, name, slug, description,
        discount_type, discount_value, max_discount, min_order_value,
        usage_limit, used_count, start_date, end_date, status,
        created_at, updated_at
      FROM vouchers
      WHERE ${whereSql}
      ORDER BY ${orderBy}
      LIMIT :limit OFFSET :offset
      `,
            {
                replacements: { userId, limit: pageSizeNum, offset },
                type: Voucher.sequelize.QueryTypes.SELECT,
            }
        );

        const data = rows.map(v => ({
            id: v.id,
            name: v.name,
            slug: v.slug,
            description: v.description,
            discount_type: v.discount_type,
            discount_value: Number(v.discount_value),
            max_discount: v.max_discount != null ? Number(v.max_discount) : null,
            min_order_value: v.min_order_value != null ? Number(v.min_order_value) : 0,
            usage_limit: Number(v.usage_limit || 0),
            used_count: Number(v.used_count || 0),
            start_date: v.start_date,
            end_date: v.end_date,
            status: v.status,
            scope: v.user_id ? "personal" : "public",
            created_at: v.created_at,
            updated_at: v.updated_at,
        }));

        return {
            success: true,
            pagination: {
                page: pageNum,
                page_size: pageSizeNum,
                total,
            },
            data,
        };
    }
}

export default new VoucherService();
