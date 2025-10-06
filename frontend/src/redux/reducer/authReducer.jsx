import { FETCH_USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS } from "../action/actionTypes";

const INITIAL_STATE = {
    accessToken: '',
    refreshToken: '',
    role: null,
    id: '',
    isAuthenticated: false,
};

const authReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FETCH_USER_LOGIN_SUCCESS:
            return {
                ...state,
                accessToken: action.payload.accessToken,
                refreshToken: action.payload.refreshToken,
                role: action.payload.role,
                id: action.payload.id,
                isAuthenticated: true,
            };

        case USER_LOGOUT_SUCCESS:
            return INITIAL_STATE;

        default:
            return state;
    }
};

export default authReducer;
