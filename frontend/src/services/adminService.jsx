import axios from "../utils/axiosCustomize.jsx"

const getAllOrders = () => {
    return axios.get(`api/admin/orders`);
};

const getAlUsers = () => {
    return axios.get(`api/admin/users`);
};

const putConfirmOrder = (id) => {
    return axios.put(`api/admin/confirm-order`,{ id });
};
export {
    getAllOrders, putConfirmOrder, getAlUsers
};