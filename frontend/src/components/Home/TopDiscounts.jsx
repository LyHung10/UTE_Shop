// src/components/Home/TopDiscounts.jsx
import React, { useEffect, useState } from "react";
import { getTopDiscount } from "../../services/productService";

export default function TopDiscounts() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        getTopDiscount(4)
            .then((data) => {
                console.log("TopDiscount API data:", data); // <-- log ra đây

                if (mounted) {
                    setItems(Array.isArray(data) ? data : []);
                    setError(null);
                }
            })
            .catch((err) => {
                console.error("Lỗi khi fetch top discount:", err);
                if (mounted) setError("Không lấy được dữ liệu.");
            })
            .finally(() => mounted && setLoading(false));

        return () => (mounted = false);
    }, []);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <section className="p-4">
            <h2 className="text-xl font-semibold mb-4">Sản phẩm khuyến mãi cao</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((p) => {
                    const thumb = p.images && p.images.length ? p.images[0].url : "/vite.svg";

                    return (
                        <div key={p.id} className="border rounded-md p-3 shadow-sm bg-white">
                            <div className="relative">
                                <img
                                    src={thumb}
                                    alt={(p.images && p.images[0] && p.images[0].alt) || p.name}
                                    className="w-full h-40 object-cover rounded"
                                />
                                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs rounded">
                                    -{p.discount_percent ?? 0}%
                                </div>
                            </div>

                            <div className="mt-2">
                                <h3 className="text-sm font-medium text-gray-800 truncate" title={p.name}>
                                    {p.name}
                                </h3>

                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-lg font-semibold text-green-700">{formatCurrency(p.price)}</span>
                                    {p.original_price && (
                                        <span className="text-sm line-through text-gray-400">{formatCurrency(p.original_price)}</span>
                                    )}
                                </div>

                                <div className="mt-3 flex gap-2">
                                    <a
                                        href={`/products/${p.slug || p.id}-${p.id}`}
                                        className="text-xs px-3 py-1 border rounded hover:bg-gray-50"
                                    >
                                        Xem chi tiết
                                    </a>
                                    <button
                                        className="ml-auto bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                        onClick={() => handleAddToCart(p)}
                                    >
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function formatCurrency(value) {
    if (!value) return "";
    return Number(value).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function handleAddToCart(product) {
    alert(`Thêm "${product.name}" vào giỏ (demo).`);
}
