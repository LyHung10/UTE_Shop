import {AUTH_OTP} from "../action/authOtpAction.jsx";


const INITIAL_STATE = {
    authOtp: {
        email: "",
        otp: "",
        isForgotPassword:false,
    }
};
const authOtpReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case AUTH_OTP:
            return {//...state copy state tr đó rồi ghi đè state mới lên
                ...state, authOtp: {
                    ...state.authOtp,      // copy toàn bộ field cũ trong authOtp
                    email: action?.payload?.email,
                    otp: action?.payload?.otp,
                    isForgotPassword:action?.payload?.isForgotPassword,
                },
            };
        default:
            return state;
    }
};

export default authOtpReducer;