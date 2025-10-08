// services/reviewService.jsx
import axiosCustomize from "@/utils/axiosCustomize";

export const createReview = (data) => {
    return axiosCustomize.post("api/reviews", data);
};

export const getReviewableProducts = (orderId) => {
    return axiosCustomize.get(`api/orders/${orderId}/reviewable-products`);
};