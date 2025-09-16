import { VNPay, ProductCode, VnpLocale, dateFormat, ignoreLogger } from "vnpay";
import dotenv from 'dotenv';
dotenv.config();

const vnpay = new VNPay({
    tmnCode: process.env.VNP_TMN_CODE || "YOUR_TMN_CODE",
    secureSecret: process.env.VNP_HASH_SECRET || "YOUR_SECRET",
    vnpayHost: process.env.VNP_HOST || "https://sandbox.vnpayment.vn",
    testMode: true,
    hashAlgorithm: "SHA512",
    loggerFn: ignoreLogger
});

class PaymentService {
    async createPayment(order) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Ensure amount is properly formatted and converted
        const amount = Number(order.amount);
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Invalid payment amount');
        }

        // VNPay requires amount in VND cents (multiply by 100)
        const vnpAmount = Math.round(amount * 100);

        console.log("Original amount:", order.amount);
        console.log("VNPay amount (VND cents):", vnpAmount);

        const paymentData = {
            vnp_Amount: vnpAmount,
            vnp_IpAddr: order.ip,
            vnp_TxnRef: order.id.toString(),
            vnp_OrderInfo: order.description,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: process.env.VNP_RETURN_URL,
            vnp_Locale: VnpLocale.VN,
            vnp_CreateDate: dateFormat(new Date()),
            vnp_ExpireDate: dateFormat(tomorrow)
        };

        console.log("Payment data being sent:", paymentData);

        return await vnpay.buildPaymentUrl(paymentData);
    }

    async verifyPayment(query) {
        try {
            console.log("VNPay verification - Raw query:", query);

            // Log the amount from the query for debugging
            console.log("VNPay verification - Amount from query:", query.vnp_Amount);

            const result = vnpay.verifyReturnUrl(query);
            console.log("VNPay verify result:", result);

            return result;
        } catch (error) {
            console.error("VNPay verification error:", error);
            console.error("Query parameters:", query);
            throw error;
        }
    }
}

export default new PaymentService();