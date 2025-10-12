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

const getProductsByCategorySlug = (
    category,      // slug danh mục
    page = 1,      // trang hiện tại
    params = {}    // { sizes, colors, sort, limit, priceMin, priceMax, priceRange }
) => {
    const { sizes, colors, sort, priceMin, priceMax, priceRange } = params;

    // Chuẩn hoá vì backend chấp nhận "M,L" hoặc mảng
    const toCSV = (v) => Array.isArray(v) ? v.join(",") : v;

    // priceRange: có thể truyền string "min-max" hoặc mảng ["min-max","min-max"]
    // -> giữ nguyên: nếu là array để axios serialize thành nhiều param; nếu string thì gửi string.
    const has = (v) => v !== undefined && v !== null && v !== "";

    return axios.get(`/api/products/${category}/${page}`, {
        params: {
            sizes: toCSV(sizes),
            colors: toCSV(colors),
            sort,
            ...(has(priceMin)  ? { priceMin: Number(priceMin) } : {}),
            ...(has(priceMax)  ? { priceMax: Number(priceMax) } : {}),
            ...(has(priceRange) ? { priceRange } : {}), // string hoặc array đều OK với controller
        },
    });
};

const getSimilarProducts = (productId) => {
    return axios.get(`api/products/${productId}/similar`);
};

const getDistinctSizesAndColors = (opts = {}) => {
    const { categorySlug, onlyActive } = opts; // onlyActive mặc định backend = true
    return axios.get("api/products/filters", {
        params: {
            ...(categorySlug ? { categorySlug } : {}),
            ...(onlyActive !== undefined ? { onlyActive } : {}),
        },
    });
};
const getAllProducts = (page = 1, limit = 100) => {
    return axios.get("api/products", {
        params: { page, limit }
    });
}export {
    getTopDiscount, getNewestProducts, getTopDiscountProducts, getMostViewedProducts, getBestSellingProducts,
    getProductById, getProductsByCategorySlug, getSimilarProducts, getDistinctSizesAndColors,getAllProducts
};
