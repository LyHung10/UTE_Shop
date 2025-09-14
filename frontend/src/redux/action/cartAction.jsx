// cartAction.js
import axios from "../../utils/axiosCustomize.jsx"

export const ADD_TO_CART = "ADD_TO_CART";
export const UPDATE_QTY = "UPDATE_QTY";
export const REMOVE_FROM_CART = "REMOVE_FROM_CART";
export const CLEAR_CART = "CLEAR_CART";
export const FETCH_CART = "FETCH_CART";
export const SET_CART_ERROR = "SET_CART_ERROR";
export const SET_CART_LOADING = "SET_CART_LOADING";
export const SET_CART_COUNT = "SET_CART_COUNT";

export const setCartCount = (count) => ({
    type: SET_CART_COUNT,
    payload: count,
});

export const fetchCartCount = () => async (dispatch) => {
    try {
        const res = await axios.get("api/orders/cart/count");
        dispatch(setCartCount(res.count));
    } catch (err) {
        console.error("Failed to fetch cart count", err);
    }
};
// Thêm sản phẩm vào giỏ
export const addToCart = (productId, qty, color, size) => async (dispatch) => {
    try {
        dispatch({ type: SET_CART_LOADING, payload: true });

        await axios.post('api/orders/cart', {
            productId,
            qty,
            color: color || null,
            size: size || null
        });

        // Fetch lại cart sau khi add
        const res = await axios.get('api/orders/cart');

        dispatch({
            type: FETCH_CART,
            payload: res // Đảm bảo lấy .data
        });
        dispatch(fetchCartCount());

        dispatch({ type: SET_CART_LOADING, payload: false });
    } catch (err) {
        console.error("Error adding to cart:", err);
        dispatch({ type: SET_CART_ERROR, payload: err.message });
        dispatch({ type: SET_CART_LOADING, payload: false });
    }
};

// Cập nhật số lượng sản phẩm
export const updateQuantity = (itemId, qty) => async (dispatch) => {
    try {
        dispatch({ type: SET_CART_LOADING, payload: true });

        await axios.put('api/orders/cart', { itemId, qty });

        // Fetch lại cart sau khi update
        const res = await axios.get('api/orders/cart');
        console.log("Update quantity - response:", res);

        dispatch({
            type: FETCH_CART,
            payload: res
        });

        dispatch({ type: SET_CART_LOADING, payload: false });
    } catch (err) {
        console.error("Error updating quantity:", err);
        dispatch({ type: SET_CART_ERROR, payload: err.message });

        // Fallback: update local state only
        dispatch({ type: UPDATE_QTY, payload: { itemId, qty } });
        dispatch({ type: SET_CART_LOADING, payload: false });
    }
};

// Xóa sản phẩm khỏi giỏ
export const removeFromCart = (itemId) => async (dispatch) => {
    try {
        dispatch({ type: SET_CART_LOADING, payload: true });

        await axios.delete(`api/orders/cart/${itemId}`);

        // Fetch lại cart sau khi delete
        const res = await axios.get('api/orders/cart');
        console.log("Remove from cart - response:", res);

        dispatch({
            type: FETCH_CART,
            payload: res
        });

        dispatch({ type: SET_CART_LOADING, payload: false });
    } catch (err) {
        console.error("Error removing from cart:", err);
        dispatch({ type: SET_CART_ERROR, payload: err.message });

        // Fallback: remove from local state only
        dispatch({ type: REMOVE_FROM_CART, payload: itemId });
        dispatch({ type: SET_CART_LOADING, payload: false });
    }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = () => async (dispatch) => {
    try {
        dispatch({ type: SET_CART_LOADING, payload: true });

        await axios.delete('api/orders/cart');
        dispatch({ type: CLEAR_CART });

        dispatch({ type: SET_CART_LOADING, payload: false });
    } catch (err) {
        console.error("Error clearing cart:", err);
        dispatch({ type: SET_CART_ERROR, payload: err.message });

        // Fallback: clear local state only
        dispatch({ type: CLEAR_CART });
        dispatch({ type: SET_CART_LOADING, payload: false });
    }
};

// Lấy giỏ hàng từ server
export const fetchCart = () => async (dispatch) => {
    try {
        dispatch({ type: SET_CART_LOADING, payload: true });

        const res = await axios.get('api/orders/cart');
        console.log("Fetched cart data:", res);

        // Đảm bảo data có đúng structure
        const cartData = res || {};

        dispatch({
            type: FETCH_CART,
            payload: {
                items: Array.isArray(cartData.items) ? cartData.items :
                    Array.isArray(cartData) ? cartData : []
            }
        });

        dispatch({ type: SET_CART_LOADING, payload: false });
    } catch (err) {
        console.error("Error fetching cart:", err);
        dispatch({ type: SET_CART_ERROR, payload: err.message });

        // Set empty cart on error
        dispatch({
            type: FETCH_CART,
            payload: { items: [] }
        });

        dispatch({ type: SET_CART_LOADING, payload: false });
    }
};