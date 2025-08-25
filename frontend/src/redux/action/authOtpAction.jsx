export const AUTH_OTP = 'AUTH_OTP';


export const authOTP = (data) => {
    return {
        type: AUTH_OTP,
        payload: data
    };
};
