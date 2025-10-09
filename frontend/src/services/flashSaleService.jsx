// services/flashSaleService.jsx
import axiosCustomize from "@/utils/axiosCustomize";

export const getCurrentFlashSales = () => {
    return axiosCustomize.get("api/flash-sales/current");
};

export const getFlashSaleDetail = (id) => {
    return axiosCustomize.get(`api/flash-sales/${id}`);
};

export const getFlashSaleProducts = (id, params = {}) => {
    return axiosCustomize.get(`api/flash-sales/${id}/products`, { params });
};

export const createFlashSaleOrder = (data) => {
    return axiosCustomize.post("api/flash-sales/order", data);
};

export const getUserFlashSaleOrders = (params = {}) => {
    return axiosCustomize.get("api/flash-sales/user/orders", { params });
};

// Admin functions
export const createFlashSale = (data) => {
    return axiosCustomize.post("api/flash-sales", data);
};

export const updateFlashSale = (id, data) => {
    return axiosCustomize.put(`api/flash-sales/${id}`, data);
};

export const addProductsToFlashSale = (id, products) => {
    return axiosCustomize.post(`api/flash-sales/${id}/products`, { products });
};