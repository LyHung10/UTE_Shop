import axios from "../utils/axiosCustomize.jsx"

export async function getTopDiscount(limit = 4) {
    const res = await axios.get(`api/products/top-discount?limit=${limit}`);
    return res;
}
const getNewestProducts = () => {
    return axios.get("api/products/newest");
}
const getTopDiscountProducts = () => {
    return axios.get("api/products/newest");
}
const getMostViewedProducts = () => {
    return axios.get("api/products/most-viewed");
}
const getBestSellingProducts = () => {
    return axios.get("api/products/best-selling");
}

export {getNewestProducts,getTopDiscountProducts,getMostViewedProducts,getBestSellingProducts}