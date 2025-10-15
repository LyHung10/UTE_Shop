import axios from "../utils/axiosCustomize.jsx"

const getCart = (voucherCode) => {
    const url = voucherCode
        ? `api/orders/cart?voucherCode=${voucherCode}`
        : `api/orders/cart`;
    return axios.get(url);
}

const postCheckoutCOD = (voucherCode, addressId, shippingFee) => {
    const url = `api/orders/checkout/cod`;
    const data = voucherCode ? { voucherCode, addressId, shippingFee} : {addressId, shippingFee};
    return axios.post(url, data);
};

const postCheckoutVnpay = (voucherCode, addressId, shippingFee) => {
    const url = `api/orders/checkout/vnpay`;
    const data = voucherCode ? { voucherCode, addressId, shippingFee} : {addressId, shippingFee};
    return axios.post(url, data);
};

export { getCart, postCheckoutCOD, postCheckoutVnpay}
