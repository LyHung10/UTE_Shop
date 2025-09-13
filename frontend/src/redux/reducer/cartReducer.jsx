// cartReducer.js
import { FETCH_CART, ADD_TO_CART, UPDATE_QTY, REMOVE_FROM_CART, CLEAR_CART } from "../action/cartAction";

const initialState = {
  items: [], // {id, name, price, qty}
};

export default function cartReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_CART:
      return {
        ...state,
        items: action.payload.data || action.payload || [] // Xử lý cả trường hợp có nested data
      };

    case ADD_TO_CART:
      return {
        ...state,
        items: action.payload.data || action.payload || []
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