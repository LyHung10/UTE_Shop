import axios from "../utils/axiosCustomize.jsx";

const getTopDiscount = (limit = 4) => {
    return axios.get(`api/products/top-discount?limit=${limit}`);
};

const getNewestProducts = () => {
    return axios.get("api/products/newest");
};

const getTopDiscountProducts = () => {
    return axios.get("api/products/top-discount");
};

const getMostViewedProducts = () => {
    return axios.get("api/products/most-viewed");
};

const getBestSellingProducts = () => {
    return axios.get("api/products/best-selling");
};

const getProductById = (id) => {
    return axios.get(`api/products/${id}`);
};

const getProductsByCategorySlug = (category,page) => {
    return axios.get(`api/products/${category}/${page}`);
};

const getSimilarProducts = (productId) => {
    return axios.get(`api/products/${productId}/similar`);
};

export {
    getTopDiscount, getNewestProducts, getTopDiscountProducts, getMostViewedProducts, getBestSellingProducts,
    getProductById, getProductsByCategorySlug, getSimilarProducts
};
