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
        console.log("VNPay amount input:", order.amount);
        console.log("VNPay amount x100:", Math.round(order.amount * 100));

        return await vnpay.buildPaymentUrl({
            vnp_Amount: Math.round(Number(order.amount) * 100).toString(),
            vnp_IpAddr: order.ip,
            vnp_TxnRef: order.id,
            vnp_OrderInfo: order.description,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: process.env.VNP_RETURN_URL,
            vnp_Locale: VnpLocale.VN,
            vnp_CreateDate: dateFormat(new Date()),
            vnp_ExpireDate: dateFormat(tomorrow)
        });
    }

    async verifyPayment(query) {
        const result = vnpay.verifyReturnUrl(query);
        console.log("VNPay verify result:", result);
        console.log("VNPay raw query:", query);
        return result;
    }

}

export default new PaymentService();
