import paymentService from "../services/paymentService.js";
import paypal from "@paypal/checkout-server-sdk";

// ========== Helpers PayPal ==========
function paypalClient() {
    const env = new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET);
    return new paypal.core.PayPalHttpClient(env);
}

// Làm tròn 2 chữ số cho các tiền tệ có 2 decimals (USD/EUR…)
const round2 = (n) => Number(n).toFixed(2);

// Nếu items là VND và có fxVndUsd (VND per 1 USD), sẽ tự quy đổi sang USD.
// Ngược lại, nếu items đã là USD thì truyền currency="USD" và price là USD.
function calculateOrderAmount({ items = [], fxVndUsd }) {
    if (!Array.isArray(items) || items.length === 0) return "0.00";
    // Mặc định: currency là USD, items có price (USD)
    const subtotal = items.reduce(
        (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1),
        0
    );
    return round2(round2(subtotal/Number(fxVndUsd)));
}

// ========== VNPAY (bạn đã có) ==========
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

// check callback từ VNPAY (bạn đã có)
export const checkPayment = async (req, res) => {
    try {
        const result = await paymentService.verifyPayment(req.query);
        if (result.success) {
            return res.redirect(`http://localhost:5173/payment/completed`);
        } else {
            return res.redirect(`http://localhost:5173`);
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Thanh toán thất bại!" });
    }
};

export const createPayPal = async (req, res) => {
    try {
        let { items = [], fxVndUsd, description } = req.body;

        // Chuẩn hóa currency (PayPal không hỗ trợ VND -> sẽ tự force sang USD nếu người dùng gửi VND)
        const valueUSD = calculateOrderAmount({ items, fxVndUsd });
        console.log(valueUSD);
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: valueUSD,
                    },
                    description: description?.slice(0, 120), // tránh quá dài
                },
            ],
            application_context: {
                shipping_preference: "NO_SHIPPING", // tuỳ nhu cầu
                user_action: "PAY_NOW",
            },
        });

        const client = paypalClient();
        const order = await client.execute(request);
        return res.status(201).json({ id: order.result.id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to create PayPal order" });
    }
};

export const checkout = async (req, res) => {
    try {
        const { orderID } = req.body;
        if (!orderID) {
            return res.status(400).json({ error: "orderID is required" });
        }

        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({}); // body rỗng theo spec

        const client = paypalClient();
        const capture = await client.execute(request);

        // TODO: cập nhật trạng thái đơn hàng trong DB của bạn ở đây (idempotent)
        // ví dụ: paymentService.markPaid({ provider: 'paypal', orderID, capture })

        return res.status(200).json({ capture: capture.result });
    } catch (err) {
        console.error(err);
        // PayPal trả lỗi chi tiết trong err.message / err.statusCode
        return res.status(500).json({ error: "Failed to capture PayPal order" });
    }
};

