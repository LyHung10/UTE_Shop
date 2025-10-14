import {dateFormat, ignoreLogger, ProductCode, VNPay, VnpLocale} from "vnpay";
import dotenv from 'dotenv';
import {v4 as uuidv4} from 'uuid';
import OrderService from "./orderService"; // ✅ Thêm dòng này
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
        const vnpAmount = Math.round(amount);
        const txnRef = uuidv4().replace(/-/g, '').slice(0, 20);
        const paymentData = {
            vnp_Amount: vnpAmount,
            vnp_IpAddr: order.ip,
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: order.description,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: process.env.VNP_RETURN_URL,
            vnp_Locale: VnpLocale.VN,
            vnp_CreateDate: dateFormat(new Date()),
            vnp_ExpireDate: dateFormat(tomorrow)
        };

        return await vnpay.buildPaymentUrl(paymentData);
    }

    async verifyPayment(query) {
        let verify;
        const rawOrderInfo = decodeURIComponent(query.vnp_OrderInfo || '');
        const match = rawOrderInfo.match(/#(\d+)/); // tìm số sau dấu #
        const orderId = match ? parseInt(match[1], 10) : null;
        try {
            verify = vnpay.verifyReturnUrl(query);
            if (!verify.isVerified) {
                return {
                    success: false,
                    message: 'Xác thực tính toàn vẹn dữ liệu thất bại'
                }
            }
            if (!verify.isSuccess) {
                await OrderService.cancelAdminOrder(orderId);
                return {
                    success: false,
                    message: 'Đơn hàng thanh toán thất bại'
                }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Đơn hàng thanh toán thất bại'
            }
        }
        return await OrderService.confirmVNPayPayment(orderId);
    }
}

export default new PaymentService();