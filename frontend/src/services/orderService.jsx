import axios from "../utils/axiosCustomize.jsx";

const getUserOrders = (status, page) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (page) params.append("page", page);
    return axios.get(`/api/orders?${params.toString()}`);
};
const getOrderDetail = (id) => {
    return axios.get(`api/orders/${id}/detail`);
};
const postCancelOrder = (orderId) => {
    return axios.post(`api/orders/cancel`,{orderId});
};
export {
    getUserOrders, getOrderDetail, postCancelOrder
};