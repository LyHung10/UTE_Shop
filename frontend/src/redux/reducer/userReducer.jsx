// userReducer.jsx - Simple fix version
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
            return {
                ...state, 
                account: {
                    // Ưu tiên giữ token từ state cũ nếu payload không có token
                    accessToken: action?.payload?.accessToken || state.account.accessToken || '',
                    refreshToken: action?.payload?.refreshToken || state.account.refreshToken || '',
                    // Update thông tin user
                    first_name: action?.payload?.first_name || state.account.first_name || '',
                    last_name: action?.payload?.last_name || state.account.last_name || '',
                    email: action?.payload?.email || state.account.email || '',
                    address: action?.payload?.address || state.account.address || '',
                    phone_number: action?.payload?.phone_number || state.account.phone_number || '',
                    gender: action?.payload?.gender || state.account.gender || '',
                    image: action?.payload?.image || state.account.image || '',
                },
                isAuthenticated: true
            };
            
        case USER_LOGOUT_SUCCESS:
            return {
                ...state, 
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
            
        default:
            return state;
    }
};

export default userReducer;