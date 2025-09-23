import voucherService from "../services/voucherService";

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
}

module.exports = new VoucherController();