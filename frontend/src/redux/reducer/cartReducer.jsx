// cartReducer.js
import {
  FETCH_CART, ADD_TO_CART, UPDATE_QTY, REMOVE_FROM_CART, CLEAR_CART,
  SET_CART_COUNT, CHECKOUT_COD_SUCCESS, CHECKOUT_COD_FAIL,
  CONFIRM_COD_SUCCESS, CONFIRM_COD_FAIL,
  CREATE_VNPAY_ORDER_FAIL, CREATE_VNPAY_ORDER_SUCCESS,
  RESET_CART
} from "../action/actionTypes";

const initialState = {
  items: [], // {id, name, price, qty}
  count: 0,
  total: 0,
  tax: 40000,
  finalTotal: 0,
  appliedVoucher: "",
  addressId: "",
  discount: 0,
  shippingFee: 0,
  order: null,
  payment: null,
  loading: false,
  error: null,
};

export default function cartReducer(state = initialState, action) {
  switch (action.type) {
    case RESET_CART:
      return initialState;

    case FETCH_CART:
      return {
        ...state,
        items: Array.isArray(action.payload.items) ? action.payload.items : [],
        count: action.payload.count,
        total: action.payload.total,
        finalTotal : action.payload.finalTotal,
        discount: action.payload.discount,
        appliedVoucher: action.payload.appliedVoucher,
        addressId: action.payload.addressId,
        shippingFee: action.payload.shippingFee,
      };

    case UPDATE_QTY:
      // Cập nhật qty của item cụ thể
      return {
        ...state,
        items: state.items.map(item =>
          item.productId === action.payload.productId
            ? { ...item, qty: action.payload.qty }
            : item
        )
      };

    case REMOVE_FROM_CART:
      // Xóa item khỏi cart
      return {
        ...state,
        items: state.items.filter(item => item.productId !== action.payload)
      };

    case CLEAR_CART:
      return {
        ...state,
        items: []
      };

    default:
      return state;
  }
}
