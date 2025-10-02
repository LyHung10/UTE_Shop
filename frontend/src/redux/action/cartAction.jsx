import axios from "../../utils/axiosCustomize.jsx";
import {
    UPDATE_QTY, REMOVE_FROM_CART, CLEAR_CART, FETCH_CART,
    SET_CART_ERROR, SET_CART_LOADING, CONFIRM_COD_SUCCESS, CONFIRM_COD_FAIL,
    CHECKOUT_COD_SUCCESS, CHECKOUT_COD_FAIL,
    RESET_CART,
    CREATE_VNPAY_ORDER_SUCCESS, CREATE_VNPAY_ORDER_FAIL
} from "./actionTypes";
import {getCart, postCheckoutCOD} from "@/services/cartService.jsx";

export const addToCart = (productId, qty, color, size) => async (dispatch) => {
    try {
        dispatch({ type: SET_CART_LOADING, payload: true });
        await axios.post('api/orders/cart', {
            productId,
            qty,
            color: color || null,
            size: size || null
        });
        dispatch(fetchCart());
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
        dispatch(fetchCart());
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
        dispatch(fetchCart());
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
// redux/action/cartAction.js
export const resetCart = () => ({
    type: RESET_CART
});

// Lấy giỏ hàng từ server
export const fetchCart = (voucherId, addressId) => async (dispatch) => {
    try {
        dispatch({ type: SET_CART_LOADING, payload: true });

        const res = await getCart(voucherId);

        // Đảm bảo data có đúng structure
        const cartData = res || {};
        dispatch({
            type: FETCH_CART,
            payload: {
                items: Array.isArray(cartData.items) ? cartData.items :
                    Array.isArray(cartData) ? cartData : [],
                count: cartData.itemCount,
                total: res.total,
                finalTotal: res.finalTotal,
                addressId: addressId,
                discount: res.discount,
                appliedVoucher: res.appliedVoucher,
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


// Checkout COD
export const checkoutCOD = (voucherCode, addressId) => async (dispatch) => {
    try {
        const res = await postCheckoutCOD(voucherCode, addressId);

        dispatch({
            type: "CHECKOUT_COD_SUCCESS",
            payload: res,
        });
        dispatch(fetchCart());
        return res; // để component còn dùng tiếp
    } catch (err) {
        console.error("checkoutCOD error", err);
        dispatch({ type: "CHECKOUT_COD_FAIL" });
        throw err;
    }
};

// Confirm COD Payment
export const confirmCODPayment = (orderId) => async (dispatch) => {
    try {
        const res = await axios.put(
            `api/orders/${orderId}/confirm-cod`
        );

        dispatch({
            type: "CONFIRM_COD_SUCCESS",
            payload: res,
        });

        return res;
    } catch (err) {
        console.error("confirmCODPayment error", err);
        dispatch({ type: "CONFIRM_COD_FAIL" });
        throw err;
    }
};

export const createVNPayOrder = (items) => async (dispatch) => {
    try {
        const res = await axios.post("api/orders/checkout/vnpay", { items });
        dispatch({ type: CREATE_VNPAY_ORDER_SUCCESS, payload: res });
        return res; // { orderId, paymentUrl }
    } catch (err) {
        dispatch({ type: CREATE_VNPAY_ORDER_FAIL });
        console.error("VNPay checkout error:", err);
        throw err;
    }
};