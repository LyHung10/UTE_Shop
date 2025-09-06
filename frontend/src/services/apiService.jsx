import axios from "../utils/axiosCustomize.jsx"

const postLogin = (email, password) => {
    return axios.post("api/auth/login", {
        email: email,
        password: password
    });
}
const postSignup = (email, password) => {
    return axios.post("api/auth/register", {
        email: email,
        password: password
    });
}
const postAuthOtp = (email, otp) => {
    return axios.post("api/auth/verify-otp", {
        email: email,
        otp: otp
    });
}
const postForgotPassword = (email) => {
    return axios.post("api/auth/forgot-password", {
        email: email
    });
}
const postResetPassword = (email, otp, newPassword) => {
    return axios.post("api/auth/reset-password", {
        email: email,
        otp: otp,
        newPassword: newPassword
    });
}
const getUser = () => {
    return axios.get("/api/users/profile");
}

export { getUser, postLogin, postSignup, postAuthOtp, postForgotPassword, postResetPassword }

