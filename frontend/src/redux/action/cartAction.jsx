// cartAction.js
import axios from "../../utils/axiosCustomize.jsx"

export const ADD_TO_CART = "ADD_TO_CART";
export const UPDATE_QTY = "UPDATE_QTY";
export const REMOVE_FROM_CART = "REMOVE_FROM_CART";
export const CLEAR_CART = "CLEAR_CART";
export const FETCH_CART = "FETCH_CART";

// Thêm sản phẩm vào giỏ
export const addToCart = (productId, qty) => async (dispatch) => {
    try {
        await axios.post('/api/orders/cart', { productId, qty });
        // Sau khi thêm xong thì fetch lại giỏ hàng để có list items đầy đủ
        const res = await axios.get('/api/orders/cart');
        dispatch({ type: FETCH_CART, payload: res });
    } catch (err) {
        console.error("Error adding to cart:", err);
    }
};

// Cập nhật số lượng sản phẩm - GỌI API
export const updateQuantity = (productId, qty) => async (dispatch) => {
    try {
        await axios.put('/api/orders/cart', { productId, qty });
        // Fetch lại cart sau khi update
        const res = await axios.get('/api/orders/cart');
        dispatch({ type: FETCH_CART, payload: res });
    } catch (err) {
        console.error("Error updating quantity:", err);
        // Fallback: update local state only
        dispatch({ type: UPDATE_QTY, payload: { productId, qty } });
    }
};

// Xóa sản phẩm khỏi giỏ - GỌI API
export const removeFromCart = (productId) => async (dispatch) => {
    try {
        await axios.delete(`/api/orders/cart/${productId}`);
        // Fetch lại cart sau khi delete
        const res = await axios.get('/api/orders/cart');
        dispatch({ type: FETCH_CART, payload: res });
    } catch (err) {
        console.error("Error removing from cart:", err);
        // Fallback: remove from local state only
        dispatch({ type: REMOVE_FROM_CART, payload: productId });
    }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = () => async (dispatch) => {
    try {
        await axios.delete('/api/orders/cart');
        dispatch({ type: CLEAR_CART });
    } catch (err) {
        console.error("Error clearing cart:", err);
        // Fallback: clear local state only
        dispatch({ type: CLEAR_CART });
    }
};

// Lấy giỏ hàng từ server
export const fetchCart = () => async (dispatch) => {
    try {
        const res = await axios.get('/api/orders/cart');
        console.log("Fetched cart data:", res);
        dispatch({ type: FETCH_CART, payload: res });
    } catch (err) {
        console.error("Error fetching cart:", err);
    }
};