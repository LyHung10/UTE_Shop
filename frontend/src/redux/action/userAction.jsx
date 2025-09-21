import { FETCH_USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS } from "./actionTypes";
import { resetCart } from "./cartAction";

export const doLogin = (data) => ({
  type: FETCH_USER_LOGIN_SUCCESS,
  payload: data,
});

export const doLogout = () => {
  return (dispatch) => {
    dispatch({ type: USER_LOGOUT_SUCCESS }); // clear user
    dispatch(resetCart()); // clear giỏ hàng
  };
};
