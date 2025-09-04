import React, { useEffect, useState } from "react";
import { Star } from "lucide-react"; // giả sử bạn dùng lucide-react
import { getTopDiscount } from "../../../services/productService.jsx";

export default function TopDiscounts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    getTopDiscount(4)
      .then((data) => {
        if (mounted) setItems(Array.isArray(data) ? data : []);
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
      <h2 className="text-3xl font-bold text-center mb-12 text-black">SẢN PHẨM KHUYẾN MÃI CAO</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {items.map((p) => {
          const thumb = p.images && p.images.length ? p.images[0].url : "/vite.svg";
          const rating = Math.round((p.view_count / 50) || 4); // dummy rating 1-5

          return (
            <div key={p.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-0 overflow-hidden">
              <div className="bg-gray-100 rounded-t-lg h-48 flex items-center justify-center overflow-hidden">
                <img src={thumb} alt={p.name} className="object-cover w-full h-full" />
              </div>

              <div className="p-4">
                <h4 className="font-semibold mb-2 truncate">{p.name}</h4>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                    {[...Array(5 - rating)].map((_, i) => (
                      <Star key={i + rating} className="w-4 h-4" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{rating}/5</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg text-green-700">{formatCurrency(p.price)}</span>
                  {p.original_price && (
                    <span className="text-gray-500 line-through">{formatCurrency(p.original_price)}</span>
                  )}
                  {p.discount_percent && (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">-{p.discount_percent}%</span>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
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
