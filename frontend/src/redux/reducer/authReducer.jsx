import { FETCH_USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS } from "../action/actionTypes";

const INITIAL_STATE = {
    token: {
        accessToken: '',
        refreshToken: '',
    },
    isAuthenticated: false,
};

const authReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FETCH_USER_LOGIN_SUCCESS:
            return {
                ...state,
                token: {
                    accessToken: action.payload.accessToken,
                    refreshToken: action.payload.refreshToken,
                },
                isAuthenticated: true,
            };

        case USER_LOGOUT_SUCCESS:
            return INITIAL_STATE;

        default:
            return state;
    }
};

export default authReducer;
