import axios from "../utils/axiosCustomize.jsx";

const getUserOrders = (status) => {
    return axios.get(`api/orders?status=${status}`);
};

export {
    getUserOrders
};