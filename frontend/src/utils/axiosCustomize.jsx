//utils/axiosCustomize
import axios from "axios";
import NProgress from "nprogress";
import {doLogin} from "@/redux/action/authAction.jsx";
import {store} from "@/redux/store.jsx";
import {refreshToken} from "@/services/authService.jsx";

NProgress.configure(
    {
        showSpinner: false,
        trickleSpeed: 100
    }
);
const instance = axios.create({
    baseURL: "http://localhost:4000/",
    withCredentials: true,    // bật nếu dùng cookie/session
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};


instance.interceptors.request.use(
    function (config) {
        const state = store.getState();
        const access_token = state.authStatus?.accessToken;
        const isAuthenticated = state.authStatus?.isAuthenticated;

        if (access_token && isAuthenticated) {
            config.headers["Authorization"] = `Bearer ${access_token}`;
        }

        NProgress.start();
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    function (response) {
        NProgress.done();
        return response && response.data ? response.data : response;
    },
    async (error) => {
        NProgress.done();
        const originalRequest = error.config;
        const state = store.getState();
        const token = state.authStatus;

        if (error.response && error.response.status === 401 && !originalRequest._retry && token.isAuthenticated) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        originalRequest.headers["Authorization"] = "Bearer " + newToken;
                        return instance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await refreshToken(token?.refreshToken);
                const newAccessToken = res.accessToken; // ⚠️ Đảm bảo res có đúng field

                // ✅ Lưu token mới vào Redux
                store.dispatch(
                    doLogin({
                        accessToken: newAccessToken,
                        refreshToken: token?.refreshToken, // Giữ refresh token cũ
                        role: token?.role, // Giữ refresh token cũ
                    })
                );

                processQueue(null, newAccessToken);
                // ✅ Retry lại request ban đầu
                originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
                return instance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // store.dispatch(doLogout());
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return error?.response?.data || Promise.reject(error);
    }
);
export default instance;
