import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../../../utils/axiosCustomize";

const VNPayReturnPage = () => {
    const [params] = useSearchParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const confirmPayment = async () => {
            const orderId = params.get("vnp_TxnRef");
            const responseCode = params.get("vnp_ResponseCode");

            if (responseCode === "00") {
                // gọi backend confirm
                await axios.put(`api/orders/${orderId}/confirm-vnpay`);

                // clear cart
                dispatch({ type: "CLEAR_CART" });
                dispatch({ type: "SET_CART_COUNT", payload: 0 });

                alert("Thanh toán VNPay thành công!");
                navigate("/");
            } else {
                alert("Thanh toán VNPay thất bại hoặc bị hủy!");
                navigate("/cart");
            }
        };

        confirmPayment();
    }, []);

    return <div>Đang xử lý kết quả thanh toán...</div>;
};

export default VNPayReturnPage;
