import axios from "../utils/axiosCustomize.jsx"

const getUserVouchers = (page = 1) => {
    return axios.get("api/vouchers/my", {
        params: {
            page, // query param được backend đọc từ req.query.page
        },
    });
};

export {getUserVouchers}