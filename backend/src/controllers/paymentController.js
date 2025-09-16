import paymentService from "../services/paymentService.js";

// tạo thanh toán
export const createPayment = async (req, res) => {
    try {
        const { orderId, amount, description } = req.body;

        const paymentUrl = await paymentService.createPayment({
            id: orderId,
            amount: amount,
            description: description,
            ip: req.ip,
        });

        return res.status(201).json({ paymentUrl });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to create payment" });
    }
};

// check callback từ VNPAY
export const checkPayment = async (req, res) => {
    try {
        console.log("VNPAY return query:", req.query);

        // verify SecureHash (nếu muốn)
        const result = await paymentService.verifyPayment(req.query);

        return res.status(200).json({
            message: "Nhận callback thành công",
            data: result,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Payment verification failed" });
    }
};
