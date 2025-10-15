import axios from '../utils/axiosCustomize';

const adminProductService = {
    // Lấy danh sách sản phẩm
    getProducts: (params) => {
        return axios.get('api/products', { params });
    },

    // Lấy chi tiết sản phẩm
    getProductById: (id) => {
        return axios.get(`api/products/${id}`);
    },

    // Thêm sản phẩm mới
    createProduct: (formData) => {
        return axios.post('api/products/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // Cập nhật sản phẩm
    updateProduct: (id, data) => {
        return axios.put(`api/products/${id}`, data);
    },

    // Xóa sản phẩm
    deleteProduct: (id) => {
        return axios.delete(`api/products/${id}`);
    },

    // Cập nhật ảnh sản phẩm
    updateProductImages: (id, formData) => {
        return axios.put(`api/products/${id}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

export default adminProductService;