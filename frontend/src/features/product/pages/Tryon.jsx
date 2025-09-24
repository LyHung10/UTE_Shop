// src/components/VirtualTryOn.jsx
import React, { useState } from "react";
import axios from "axios";

export default function VirtualTryOn() {
  const [personFile, setPersonFile] = useState(null);
  const [clothFile, setClothFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return setError("File phải là ảnh!");
    }
    if (file.size > 10 * 1024 * 1024) {
      return setError("Ảnh quá lớn (tối đa 10MB)!");
    }

    if (type === "person") setPersonFile(file);
    else setClothFile(file);

    setError("");
  };

  const handleGenerate = async () => {
    if (!personFile || !clothFile) {
      return setError("Vui lòng chọn đủ 2 ảnh!");
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("avatar_image", personFile);
      formData.append("clothing_image", clothFile);

      const res = await axios.post(
        "https://try-on-diffusion.p.rapidapi.com/try-on-file",
        formData,
        {
          headers: {
            "X-RapidAPI-Host": "try-on-diffusion.p.rapidapi.com",
            "X-RapidAPI-Key": "1ee66f8e4bmsh76496bb819b2b81p105894jsn38f6549d7cb3", 
          },
          responseType: "arraybuffer", // lấy binary
        }
      );

      //Convert ArrayBuffer → base64 (browser way, không dùng Buffer)
      const base64 = btoa(
        new Uint8Array(res.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      const imgUrl = `data:image/jpeg;base64,${base64}`;
      setResult(imgUrl);
    } catch (err) {
      console.error("API error:", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-2xl shadow-xl">
      <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
        👗 Virtual Try-On
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Upload ảnh của bạn và quần áo muốn thử!
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Person */}
        <div className="p-4 rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition">
          <h3 className="font-semibold mb-2">📸 Ảnh của bạn</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "person")}
            className="w-full"
          />
          {personFile && (
            <img
              src={URL.createObjectURL(personFile)}
              alt="preview-person"
              className="mt-2 rounded-lg shadow-md"
            />
          )}
        </div>

        {/* Cloth */}
        <div className="p-4 rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition">
          <h3 className="font-semibold mb-2">👕 Quần áo</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "cloth")}
            className="w-full"
          />
          {clothFile && (
            <img
              src={URL.createObjectURL(clothFile)}
              alt="preview-cloth"
              className="mt-2 rounded-lg shadow-md"
            />
          )}
        </div>

        {/* Result */}
        <div className="p-4 rounded-xl bg-yellow-50 flex flex-col items-center justify-center">
          <h3 className="font-semibold mb-2">✨ Kết quả</h3>
          {loading && (
            <div className="animate-spin h-12 w-12 border-4 border-indigo-300 border-t-indigo-500 rounded-full mb-2"></div>
          )}
          {result && (
            <img
              src={result}
              alt="result"
              className="rounded-lg shadow-xl max-h-120"
            />
          )}
          {!loading && !result && (
            <p className="text-gray-400">Kết quả sẽ hiển thị ở đây</p>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-4">
        <button
          onClick={handleGenerate}
          disabled={!personFile || !clothFile || loading}
          className="px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white disabled:opacity-50 hover:scale-105 transition"
        >
          🎨 Tạo Virtual Try-On
        </button>
      </div>
    </div>
  );
}
