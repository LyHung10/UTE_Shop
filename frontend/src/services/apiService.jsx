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
const postResetPassword = (email,otp,newPassword) => {
    return axios.post("api/auth/reset-password", {
        email: email,
        otp:otp,
        newPassword:newPassword
    });
}
const getUser = (token) => {
    return axios.get("/api/users/profile", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}
export {getUser, postLogin, postSignup, postAuthOtp, postForgotPassword, postResetPassword}
// const postCreateNewUser = (email, username, password, role, image) => {
//     const data = new FormData();
//     data.append('email', email);
//     data.append('username', username);
//     data.append('password', password);
//     data.append('role', role);
//     data.append('userImage', image);
//     return axios.post("api/v1/participant", data);
// }
//
// const postUpdateNewUser = (id, username, role, image) => {
//     const data = new FormData();
//     data.append('id', id);
//     data.append('username', username);
//     data.append('role', role);
//     data.append('userImage', image);
//     return axios.put("api/v1/participant", data);
// }
// const getAllUsers = () => {
//     return axios.get("api/v1/participant/all");
// }
//
// const getUsersWithPaginate = (page, limit) => {
//     return axios.get(`api/v1/participant?page=${page}&limit=${limit}`);
// }
// const deleteUser = (userId) => {
//     return axios.delete("api/v1/participant", {data: {id: userId}});
// }
