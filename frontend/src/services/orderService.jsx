import axios from "../utils/axiosCustomize.jsx";

const getUserOrders = (status) => {
    return axios.get(`api/orders?status=${status}`);
};
const getOrderDetail = (id) => {
    return axios.get(`api/orders/${id}/detail`);
};
export {
    getUserOrders, getOrderDetail,
};