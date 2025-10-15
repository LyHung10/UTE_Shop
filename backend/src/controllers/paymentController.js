import paymentService from "../services/paymentService.js";
export const createPayment = async (req, res) => {
    try {
        const { orderId, amount, description } = req.body;

        const paymentUrl = await paymentService.createPayment({
            id: orderId,
            amount: Number(amount),
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
        const result = await paymentService.verifyPayment(req.query);
        if (result.success)
        {
            return res.redirect(`http://localhost:5173/payment/completed`);
        }
        else
        {
            return res.redirect(`http://localhost:5173`);
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Thanh toán thất bại!" });
    }
};


export const vnpayReturn= async (req, res) => {
    console.log(req.query);
};



