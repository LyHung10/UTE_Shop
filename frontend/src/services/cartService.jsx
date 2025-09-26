import axios from "../utils/axiosCustomize.jsx"

const getCart = (voucherCode) => {
    const url = voucherCode
        ? `api/orders/cart?voucherCode=${voucherCode}`
        : `api/orders/cart`;
    return axios.get(url);
}

const postCheckoutCOD = (voucherCode) => {
    const url = `api/orders/checkout/cod`;
    const data = voucherCode ? { voucherCode: voucherCode } : {};

    return axios.post(url, data);
};

export { getCart, postCheckoutCOD}
