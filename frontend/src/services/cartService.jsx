import axios from "../utils/axiosCustomize.jsx"

const getCart = (voucherCode) => {
    const url = voucherCode
        ? `api/orders/cart?voucherCode=${voucherCode}`
        : `api/orders/cart`;
    return axios.get(url);
}
// 🧾 Tạo đơn hàng PayPal
const postCreatePayPal = (items, fxVndUsd, description = "Thanh toán đơn hàng") => {
    const url = `api/payments/paypal/create`;
    const data = {
        items,
        fxVndUsd,
        description,
    };
    return axios.post(url, data);
};

// 💳 Capture (xác nhận thanh toán) PayPal
const postCheckoutPayPal = (orderID) => {
    const url = `api/payments/paypal/checkout`;
    return axios.post(url, { orderID });
};
const postCheckoutCOD = (voucherCode, addressId, shippingFee) => {
    const url = `api/orders/checkout/cod`;
    const data = voucherCode ? { voucherCode, addressId, shippingFee} : {addressId, shippingFee};
    return axios.post(url, data);
};

const createOrderPaypal = (voucherCode, addressId, shippingFee) => {
    const url = `api/orders/create/paypal`;
    const data = voucherCode ? { voucherCode, addressId, shippingFee} : {addressId, shippingFee};
    return axios.post(url, data);
};

const confirmPaypalPayment = (orderId) => {
    const url = `api/orders/confirm-paypal`;
    return axios.post(url, { orderId });
};

const postCheckoutVnpay = (voucherCode, addressId, shippingFee) => {
    const url = `api/orders/checkout/vnpay`;
    const data = voucherCode ? { voucherCode, addressId, shippingFee} : {addressId, shippingFee};
    return axios.post(url, data);
};

export { getCart, postCheckoutCOD, postCheckoutVnpay,postCreatePayPal, postCheckoutPayPal, createOrderPaypal, confirmPaypalPayment}
