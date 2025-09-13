import axios from "axios";
import NProgress from "nprogress";
import { store } from "@/redux/store.jsx";

NProgress.configure(
    {
        showSpinner: false,
        trickleSpeed: 100
    }
);
const instance = axios.create({
    baseURL: "http://localhost:4000/",
});

instance.interceptors.request.use(function (config) {
    const access_token = store.getState().user.account.accessToken;
    config.headers["Authorization"] = `Bearer ${access_token}`;
    console.log(">>> Access token trong request:", access_token);

    NProgress.start();
    // Do something before request is sent
    // log đường dẫn thực sự mà axios sẽ gọi
    console.log(">>> Request URL:", config.baseURL + config.url);

    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    NProgress.done();
    // console.log(">>> interceptor", response);
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response && response.data ? response.data : response;/**/
}, function (error) {
    console.log(">>> interceptor", error.response);
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return error && error.response && error.response.data ? error.response.data : Promise.reject(error);
});
export default instance;
