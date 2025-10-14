import axios from "../../utils/axiosCustomize.jsx";
import {
    CHECKOUT_COD_FAIL,
    CONFIRM_COD_FAIL,
    CONFIRM_COD_SUCCESS,
    FETCH_CART,
    REMOVE_FROM_CART,
    SET_CART_ERROR,
    SET_CART_LOADING
} from "./actionTypes";
import {getCart, postCheckoutCOD, postCheckoutVnpay} from "@/services/cartService.jsx";

export const addToCart = (productId, qty, color, size) => async (dispatch) => {
        try {
            dispatch({ type: SET_CART_LOADING, payload: true });
            const res = await axios.post('api/orders/cart', {
                productId,
                qty,
                color: color || null,
                size: size || null
            });
            if (res) {
                dispatch(fetchCart());
                dispatch({ type: SET_CART_LOADING, payload: false });
                return { success: res.success, message: res.message };
            }
        } catch (err) {
            console.error("Error updating quantity:", err);
            dispatch({ type: SET_CART_ERROR, payload: err.message });
            // Fallback: update local state only
            dispatch({ type: SET_CART_LOADING, payload: false });
        }
};

export const updateQuantity = (itemId, qty) => async (dispatch) => {
    try {
        dispatch({ type: SET_CART_LOADING, payload: true });
        const res = await axios.put('api/orders/cart', { itemId, qty });
        if (res)
        {
            dispatch(fetchCart());
            dispatch({ type: SET_CART_LOADING, payload: false });
            return { success: res.success, message: res.message };
        }
    } catch (err) {
        console.error("Error updating quantity:", err);
        dispatch({ type: SET_CART_ERROR, payload: err.message });
        dispatch({ type: SET_CART_LOADING, payload: false });
    }
};

export const removeFromCart = (itemId) => async (dispatch) => {
    try {
        dispatch({ type: SET_CART_LOADING, payload: true });
        await axios.delete(`api/orders/cart/${itemId}`);
        dispatch(fetchCart());
        dispatch({ type: SET_CART_LOADING, payload: false });
    } catch (err) {
        console.error("Error removing from cart:", err);
        dispatch({ type: SET_CART_ERROR, payload: err.message });
        dispatch({ type: REMOVE_FROM_CART, payload: itemId });
        dispatch({ type: SET_CART_LOADING, payload: false });
    }
};

export const fetchCart = (voucherId, addressId, shippingFee) => async (dispatch) => {
    try {
        dispatch({ type: SET_CART_LOADING, payload: true });
        const res = await getCart(voucherId);
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
                shippingFee: shippingFee,
                discount: res.discount,
                appliedVoucher: res.appliedVoucher,
            }
        });

        dispatch({ type: SET_CART_LOADING, payload: false });

        return res;
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

export const checkoutCOD = (voucherCode, addressId, shippingFee) => async (dispatch) => {
    try {
        return await postCheckoutCOD(voucherCode, addressId, shippingFee);
    } catch (err) {
        dispatch({ type: "CHECKOUT_COD_FAIL" });
        throw err;
    }
};

export const checkoutVnpay = (voucherCode, addressId, shippingFee) => async (dispatch) => {
    try {
        return await postCheckoutVnpay(voucherCode, addressId, shippingFee);
    } catch (err) {
        dispatch({ type: "CHECKOUT_Vnpay_FAIL" });
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
