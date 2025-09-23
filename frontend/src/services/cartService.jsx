import axios from "../utils/axiosCustomize.jsx"

const getCart = (voucherId) => {
    const url = voucherId
        ? `api/orders/cart?voucherCode=${voucherId}`
        : `api/orders/cart`;
    return axios.get(url);
}

export { getCart,}