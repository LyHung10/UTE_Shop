import axios from "../utils/axiosCustomize.jsx";

const getCategories = () => {
    return axios.get(`api/categories`);
};

export {
    getCategories
};