import axios from "../utils/axiosCustomize.jsx"

const getAllOrders = () => {
    return axios.get(`api/admin/orders`);
};

const getAlUsers = () => {
    return axios.get(`api/admin/users`);
};

const putConfirmOrder = (id) => {
    return axios.put(`api/admin/confirm-order`, { id });
};
export {
    getAllOrders, putConfirmOrder, getAlUsers
};

// Flash Sale
export const createFlashSale = (data) => {
    return axios.post("api/flash-sales", data);
}

export const updateFlashSale = (id, data) => {
    return axios.put(`api/flash-sales/${id}`, data);
}
export const addProductToFlashSale = async (flashSaleId, data) => {
    try {
        const response = await axios.post(`api/flash-sales/${flashSaleId}/products`, data);

        // 🎯 VÌ INTERCEPTOR ĐÃ TRẢ VỀ DATA NÊN response Ở ĐÂY CHÍNH LÀ response.data
        // response = { success: true, message: "...", data: [...] }

        // Kiểm tra nếu backend trả về success: false
        if (response && !response.success) {
            throw new Error(response.message || "Có lỗi xảy ra khi thêm sản phẩm");
        }

        return response; // ✅ KHÔNG CẦN .data VÌ INTERCEPTOR ĐÃ XỬ LÝ
    } catch (error) {
        console.error("Service Error:", error);

        // Xử lý các lỗi từ backend
        if (error?.duplicate_ids) {
            throw new Error(`Sản phẩm đã tồn tại trong flash sale: ${error.duplicate_ids.join(', ')}`);
        }
        if (error?.invalid_ids) {
            throw new Error(`Không tìm thấy sản phẩm: ${error.invalid_ids.join(', ')}`);
        }
        if (error?.errors) {
            throw new Error(error.errors.join(', '));
        }
        if (error?.message) {
            throw new Error(error.message);
        }

        throw error;
    }
};

export const deleteFlashSale = (id) => {
    return axios.delete(`api/flash-sales/${id}`);
}
// services/adminService.jsx
export const getFlashSaleDetail = async (id) => {
    try {
        const response = await axios.get(`api/flash-sales/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};
export const getAllFlashSales = () => {
    return axios.get("api/flash-sales/current");
}
// services/adminService.jsx

export const searchProducts = async (searchTerm, limit = 20) => {
    try {
        const response = await axios.get(`api/flash-sales/products/search`, {
            params: { q: searchTerm, limit }
        });
        return response;
    } catch (error) {
        throw error;
    }
};