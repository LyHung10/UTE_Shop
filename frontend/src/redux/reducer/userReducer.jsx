import { FETCH_USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS } from "../action/actionTypes";

const INITIAL_STATE = {
    account: {
        accessToken: '',
        refreshToken: '',
        first_name: '',
        last_name: '',
        email: '',
        address: '',
        phone_number: '',
        gender: '',
        image: '',
    },
    isAuthenticated: false,
};

const userReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FETCH_USER_LOGIN_SUCCESS:
            return {
                ...state,
                account: {
                    ...state.account,
                    ...action.payload, // gọn hơn, merge luôn dữ liệu từ payload
                },
                isAuthenticated: true,
            };

        case USER_LOGOUT_SUCCESS:
            return INITIAL_STATE;

        default:
            return state;
    }
};

export default userReducer;
