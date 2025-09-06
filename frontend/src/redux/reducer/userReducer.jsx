import {FETCH_USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS} from "../action/userAction.jsx";


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
    isAuthenticated: false
};
const userReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FETCH_USER_LOGIN_SUCCESS:
            return {//...state copy state tr đó rồi ghi đè state mới lên
                ...state, account: {
                    accessToken: action?.payload?.accessToken,
                    refreshToken: action?.payload?.refreshToken,
                    first_name: action?.payload?.first_name,
                    last_name: action?.payload?.last_name,
                    email: action?.payload?.email,
                    address: action?.payload?.address,
                    phone_number: action?.payload?.phone_number,
                    gender: action?.payload?.gender,
                    image: action?.payload?.image,
                },
                isAuthenticated: true
            };
        case USER_LOGOUT_SUCCESS:
            return {//...state copy state tr đó rồi ghi đè state mới lên
                ...state, account: {
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
                isAuthenticated: false
            };
        default:
            return state;
    }
};

export default userReducer;