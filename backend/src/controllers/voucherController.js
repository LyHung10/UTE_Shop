import voucherService from "../services/voucherService";
import {Voucher} from "../models/index.js";
import { Op } from "sequelize";

class VoucherController {
    async addVoucher(req, res) {
        try {
            const voucherData = {
                name: req.body.name,
                slug: req.body.slug,
                description: req.body.description,
                discount_type: req.body.discount_type,
                discount_value: req.body.discount_value,
                max_discount: req.body.max_discount,
                min_order_value: req.body.min_order_value,
                usage_limit: req.body.usage_limit,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                status: req.body.status,
            };

            const voucher = await voucherService.createVoucher(voucherData);

            res.status(201).json(voucher);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Tạo voucher thất bại",
                error: error.message
            });
        }
    }

    async addUserVoucher(req, res) {
        try {
            const {
                name,
                slug,
                description,
                discount_type,
                discount_value,
                max_discount,
                min_order_value,
                usage_limit,
                start_date,
                end_date,
                status,
                points,
            } = req.body;

            const userId = req.user?.sub;

            const result = await voucherService.redeemVoucherForUser({
                userId,
                points,
                voucherPayload: {
                    name,
                    slug,
                    description,
                    discount_type,
                    discount_value,
                    max_discount,
                    min_order_value,
                    usage_limit,
                    start_date,
                    end_date,
                    status,
                },
            });

            return res.status(201).json(result);
        } catch (error) {
            console.error('❌ Lỗi khi tạo voucher:', error);
            const status = error.statusCode || 500;
            return res.status(status).json({
                success: false,
                message: error.message || 'Lỗi tạo voucher',
            });
        }
    }

    async getUserVouchers(req, res) {
        try {
            const userId = req.user?.sub;
            const {
                page,
                page_size,
                sort,
                onlyActive,
            } = req.query;

            const result = await voucherService.getUserVouchers(userId, {
                page,
                pageSize: page_size,
                sort,
                onlyActive: onlyActive !== "false",
            });

            return res.json(result);
        } catch (error) {
            console.error("[getUserVouchers] error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Bad request",
            });
        }
    }
}

module.exports = new VoucherController();