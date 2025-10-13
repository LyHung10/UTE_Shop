// src/services/VoucherAdminService.js
import { Op, Sequelize } from "sequelize";
import { Voucher } from "../models/index.js";
import { sequelize } from "../config/configdb.js";

/**
 * Quy ước field trong DB (snake_case):
 * - name, slug, description
 * - discount_type ('percent' | 'fixed')
 * - discount_value (number; percent: 0<value<=100, fixed: >0)
 * - max_discount (nullable; >=0, chỉ áp dụng khi discount_type = 'percent')
 * - min_order_value (>=0)
 * - usage_limit (integer >=0)
 * - start_date, end_date (Date)
 * - status ('active' | 'inactive')
 * - user_id (nullable; voucher public khi null)
 */

const STATUS_ENUM = ["active", "inactive"];
const DISCOUNT_TYPE_ENUM = ["percent", "fixed"];

/** Chuẩn hoá/convert kiểu dữ liệu & trim */
function sanitizeVoucherPayload(raw) {
    const toNum = (v) => (v === null || v === undefined || v === "" ? null : Number(v));
    const toInt = (v) => (v === null || v === undefined || v === "" ? null : parseInt(v, 10));

    const payload = {
        name: raw?.name?.toString().trim(),
        slug: raw?.slug?.toString().trim(),
        description: raw?.description?.toString().trim() ?? null,
        discount_type: raw?.discount_type?.toString().trim(),
        discount_value: toNum(raw?.discount_value),
        max_discount: toNum(raw?.max_discount),
        min_order_value: toNum(raw?.min_order_value ?? 0),
        usage_limit: toInt(raw?.usage_limit ?? 0),
        start_date: raw?.start_date ? new Date(raw.start_date) : null,
        end_date: raw?.end_date ? new Date(raw.end_date) : null,
        status: raw?.status?.toString().trim(),
    };

    // Chuẩn hoá NaN -> null
    ["discount_value", "max_discount", "min_order_value"].forEach((k) => {
        if (payload[k] !== null && Number.isNaN(payload[k])) payload[k] = null;
    });
    if (payload.usage_limit !== null && Number.isNaN(payload.usage_limit)) payload.usage_limit = null;

    return payload;
}

/** Validate format slug (chữ thường, số, dấu -, không khoảng trắng) */
function isValidSlug(slug) {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/** Validate logic nghiệp vụ; ném lỗi nếu sai */
async function validateVoucherPayload(payload, { isUpdate = false, currentId = null } = {}) {
    const errs = [];

    // Bắt buộc
    if (!payload.name) errs.push("Tên voucher là bắt buộc");
    if (!payload.slug) errs.push("Slug là bắt buộc");
    if (!payload.discount_type) errs.push("Loại giảm giá (discount_type) là bắt buộc");
    if (payload.discount_value == null) errs.push("Giá trị giảm (discount_value) là bắt buộc");
    if (!payload.start_date) errs.push("Ngày bắt đầu (start_date) là bắt buộc");
    if (!payload.end_date) errs.push("Ngày kết thúc (end_date) là bắt buộc");
    if (!payload.status) errs.push("Trạng thái (status) là bắt buộc");

    // Dừng sớm nếu thiếu bắt buộc
    if (errs.length) {
        const e = new Error(errs.join("; "));
        e.statusCode = 400;
        throw e;
    }

    // Giá trị hợp lệ
    if (!DISCOUNT_TYPE_ENUM.includes(payload.discount_type)) {
        errs.push("discount_type chỉ nhận 'percent' hoặc 'fixed'");
    }
    if (!STATUS_ENUM.includes(payload.status)) {
        errs.push("status chỉ nhận 'active' hoặc 'inactive'");
    }
    if (!isValidSlug(payload.slug)) {
        errs.push("Slug không hợp lệ (chỉ chữ thường, số và dấu gạch nối)");
    }

    // Số không âm
    if (payload.min_order_value != null && payload.min_order_value < 0) {
        errs.push("min_order_value phải >= 0");
    }
    if (payload.usage_limit != null && payload.usage_limit < 0) {
        errs.push("usage_limit phải là số nguyên >= 0");
    }
    if (payload.usage_limit != null && !Number.isInteger(payload.usage_limit)) {
        errs.push("usage_limit phải là số nguyên");
    }

    // discount_value & max_discount theo từng loại
    if (payload.discount_type === "percent") {
        if (!(payload.discount_value > 0 && payload.discount_value <= 100)) {
            errs.push("Với percent, discount_value phải > 0 và <= 100");
        }
        if (payload.max_discount != null && payload.max_discount < 0) {
            errs.push("max_discount phải >= 0 (hoặc để trống)");
        }
    } else if (payload.discount_type === "fixed") {
        if (!(payload.discount_value > 0)) {
            errs.push("Với fixed, discount_value phải > 0");
        }
        // fixed thì max_discount không có ý nghĩa
        if (payload.max_discount != null && payload.max_discount < 0) {
            errs.push("max_discount phải là null hoặc >= 0");
        }
    }

    // start_date < end_date
    if (!(payload.start_date instanceof Date) || isNaN(payload.start_date)) {
        errs.push("start_date không hợp lệ");
    }
    if (!(payload.end_date instanceof Date) || isNaN(payload.end_date)) {
        errs.push("end_date không hợp lệ");
    }
    if (payload.start_date && payload.end_date && payload.start_date >= payload.end_date) {
        errs.push("start_date phải nhỏ hơn end_date");
    }

    // Slug phải duy nhất
    const where = { slug: payload.slug };
    if (isUpdate && currentId) {
        where.id = { [Op.ne]: currentId };
    }
    const dup = await Voucher.findOne({ where, attributes: ["id"] });
    if (dup) {
        errs.push("Slug đã tồn tại, vui lòng chọn slug khác");
    }

    if (errs.length) {
        const e = new Error(errs.join("; "));
        e.statusCode = 400;
        throw e;
    }
}

/** Áp các field cho instance; chỉ set các field cho phép */
function assignVoucherFields(instance, payload) {
    instance.name = payload.name;
    instance.slug = payload.slug;
    instance.description = payload.description ?? null;
    instance.discount_type = payload.discount_type;
    instance.discount_value = payload.discount_value;
    instance.max_discount = payload.discount_type === "percent" ? payload.max_discount : null;
    instance.min_order_value = payload.min_order_value ?? 0;
    instance.usage_limit = payload.usage_limit ?? 0;
    instance.start_date = payload.start_date;
    instance.end_date = payload.end_date;
    instance.status = payload.status;
}

class VoucherAdminService {
    /** Danh sách có phân trang + filter cơ bản */
    async list({ page = 1, pageSize = 10, q, status, sort = "-created_at" } = {}) {
        const pageNum = Math.max(1, Number(page) || 1);
        const sizeNum = Math.max(1, Number(pageSize) || 10);
        const offset = (pageNum - 1) * sizeNum;

        const where = {};
        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${q}%` } },
                { slug: { [Op.iLike]: `%${q}%` } },
                { description: { [Op.iLike]: `%${q}%` } },
            ];
        }
        if (status && STATUS_ENUM.includes(status)) {
            where.status = status;
        }

        const order =
            sort === "created_at" ? [["created_at", "ASC"]] : [["created_at", "DESC"]];

        const { rows, count } = await Voucher.findAndCountAll({
            where,
            order,
            limit: sizeNum,
            offset,
        });

        return {
            success: true,
            pagination: { page: pageNum, page_size: sizeNum, total: count },
            data: rows,
        };
    }

    async getById(id) {
        const voucher = await Voucher.findByPk(id);
        if (!voucher) {
            const e = new Error("Không tìm thấy voucher");
            e.statusCode = 404;
            throw e;
        }
        return { success: true, data: voucher };
    }

    /** Tạo voucher (Admin) — validate kỹ */
    async create(reqBody) {
        const raw = {
            name: reqBody?.name,
            slug: reqBody?.slug,
            description: reqBody?.description,
            discount_type: reqBody?.discount_type,
            discount_value: reqBody?.discount_value,
            max_discount: reqBody?.max_discount,
            min_order_value: reqBody?.min_order_value,
            usage_limit: reqBody?.usage_limit,
            start_date: reqBody?.start_date,
            end_date: reqBody?.end_date,
            status: reqBody?.status,
        };

        const payload = sanitizeVoucherPayload(raw);
        await validateVoucherPayload(payload, { isUpdate: false });

        return await sequelize.transaction(async (t) => {
            const voucher = await Voucher.create(payload, { transaction: t });
            return {
                success: true,
                message: "Tạo voucher thành công",
                data: await Voucher.findByPk(voucher.id, { transaction: t }),
            };
        });
    }

    /** Cập nhật voucher (Admin) — validate kỹ, kiểm tra slug trùng */
    async update(id, reqBody) {
        const voucher = await Voucher.findByPk(id);
        if (!voucher) {
            const e = new Error("Không tìm thấy voucher");
            e.statusCode = 404;
            throw e;
        }

        const raw = {
            name: reqBody?.name ?? voucher.name,
            slug: reqBody?.slug ?? voucher.slug,
            description: reqBody?.description ?? voucher.description,
            discount_type: reqBody?.discount_type ?? voucher.discount_type,
            discount_value:
                reqBody?.discount_value != null ? reqBody.discount_value : voucher.discount_value,
            max_discount:
                reqBody?.max_discount !== undefined ? reqBody.max_discount : voucher.max_discount,
            min_order_value:
                reqBody?.min_order_value !== undefined ? reqBody.min_order_value : voucher.min_order_value,
            usage_limit:
                reqBody?.usage_limit !== undefined ? reqBody.usage_limit : voucher.usage_limit,
            start_date: reqBody?.start_date ?? voucher.start_date,
            end_date: reqBody?.end_date ?? voucher.end_date,
            status: reqBody?.status ?? voucher.status,
        };

        const payload = sanitizeVoucherPayload(raw);
        await validateVoucherPayload(payload, { isUpdate: true, currentId: voucher.id });

        return await sequelize.transaction(async (t) => {
            assignVoucherFields(voucher, payload);
            await voucher.save({ transaction: t });
            return {
                success: true,
                message: "Cập nhật voucher thành công",
                data: await Voucher.findByPk(voucher.id, { transaction: t }),
            };
        });
    }

    /** Xoá voucher (hard delete). Nếu muốn soft delete có thể đổi sang status='inactive'. */
    async remove(id) {
        const voucher = await Voucher.findByPk(id);
        if (!voucher) {
            const e = new Error("Không tìm thấy voucher");
            e.statusCode = 404;
            throw e;
        }
        await voucher.destroy();
        return { success: true, message: "Đã xoá voucher" };
    }

    /** Đổi trạng thái nhanh (active/inactive) */
    async setStatus(id, status) {
        if (!STATUS_ENUM.includes(status)) {
            const e = new Error("Trạng thái không hợp lệ");
            e.statusCode = 400;
            throw e;
        }
        const voucher = await Voucher.findByPk(id);
        if (!voucher) {
            const e = new Error("Không tìm thấy voucher");
            e.statusCode = 404;
            throw e;
        }
        voucher.status = status;
        await voucher.save();
        return { success: true, message: "Cập nhật trạng thái thành công", data: voucher };
    }
}

export default new VoucherAdminService();
