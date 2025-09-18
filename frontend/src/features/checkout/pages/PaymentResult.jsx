// pages/PaymentResult.jsx
import { useEffect, useState } from "react";

const PaymentResult = () => {
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            const res = await fetch("/api/payment/return" + window.location.search);
            const data = await res.json();
            setResult(data);
        };
        fetchResult();
    }, []);

    if (!result) return <p>Đang xử lý...</p>;

    return (
        <div className="p-8">
            {result.status === "success" ? (
                <h2 className="text-green-600 font-bold text-xl">Thanh toán thành công! 🎉</h2>
            ) : (
                <h2 className="text-red-600 font-bold text-xl">Thanh toán thất bại 😢</h2>
            )}
            <pre className="mt-4 bg-gray-100 p-4 rounded">{JSON.stringify(result, null, 2)}</pre>
        </div>
    );
};

export default PaymentResult;
