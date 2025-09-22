import { useState } from "react";
import axios from "../../../utils/axiosCustomize.jsx"

export default function TryOnPage() {
    const [personUrl, setPersonUrl] = useState("");
    const [clothUrl, setClothUrl] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const res = await axios.post("api/products/tryon", {
                personUrl,
                clothUrl,
            });

            // backend trả về { result: [...] }
            setResult(res.result?.[0] || null);
        } catch (error) {
            console.error("Lỗi thử quần áo:", error);
            alert("Có lỗi khi thử quần áo!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">👕 Thử quần áo online</h2>

            <input
                type="text"
                placeholder="URL ảnh người"
                value={personUrl}
                onChange={(e) => setPersonUrl(e.target.value)}
                className="border p-2 mb-3 w-full rounded"
            />

            <input
                type="text"
                placeholder="URL ảnh quần áo"
                value={clothUrl}
                onChange={(e) => setClothUrl(e.target.value)}
                className="border p-2 mb-3 w-full rounded"
            />

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Đang xử lý..." : "Thử ngay"}
            </button>

            {result && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Kết quả:</h3>
                    <img
                        src={result}
                        alt="Try-on result"
                        className="rounded shadow-lg max-h-[500px]"
                    />
                </div>
            )}
        </div>
    );
}
