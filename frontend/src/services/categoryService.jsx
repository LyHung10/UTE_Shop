// src/services/categoryService.jsx
import axios from "../utils/axiosCustomize.jsx";

export const getCategories = () => {
    return axios.get("/api/categories");
};

export const postCategory = (payload) => {
    // payload: { name, slug, description }
    return axios.post("/api/categories", payload);
};

export const putCategory = (id, payload) => {
    return axios.put(`/api/categories/${id}`, payload);
};

export const deleteCategory = (id) => {
    return axios.delete(`/api/categories/${id}`);
};
