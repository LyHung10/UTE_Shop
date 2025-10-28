// src/components/VirtualTryOn.jsx
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";

export default function VirtualTryOn() {
  const [personFile, setPersonFile] = useState(null);
  const [clothFile, setClothFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tryOnHistory, setTryOnHistory] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef({ person: null, cloth: null });

  useEffect(() => {
    const clothUrl = location.state?.clothUrl;
    if (clothUrl) {
      fetch(clothUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "product.jpg", { type: blob.type });
          setClothFile(file);
          toast.success("Đã tải ảnh sản phẩm từ cửa hàng!");
        })
        .catch(() => toast.error("Không thể tải ảnh sản phẩm"));
    }
  }, [location.state]);

  // Simulate progress for better UX
  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 800);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh!");
      return;
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 10MB!");
      return;
    }

    // Validate image dimensions for person image
    const img = new Image();
    img.onload = () => {
      if (type === "person" && img.width < 300) {
        toast.warning("Ảnh người dùng nên có chất lượng cao hơn để cho kết quả tốt nhất!");
      }
      
      if (type === "person") setPersonFile(file);
      else setClothFile(file);
      
      setError("");
      toast.success(`Đã tải ảnh ${type === "person" ? "người dùng" : "sản phẩm"} thành công!`);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleRemoveImage = (type) => {
    if (type === "person") {
      setPersonFile(null);
      if (fileInputRef.current.person) fileInputRef.current.person.value = "";
    } else {
      setClothFile(null);
      if (fileInputRef.current.cloth) fileInputRef.current.cloth.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!personFile || !clothFile) {
      toast.error("Vui lòng chọn đầy đủ ảnh người và ảnh sản phẩm!");
      return;
    }

    setLoading(true);
    setIsGenerating(true);
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
          responseType: "arraybuffer",
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          },
        }
      );

      // Convert ArrayBuffer to base64
      const base64 = btoa(
        new Uint8Array(res.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      const imgUrl = `data:image/jpeg;base64,${base64}`;
      setResult(imgUrl);
      setProgress(100);
      
      // Save to history
      const newTryOn = {
        id: Date.now(),
        personImage: URL.createObjectURL(personFile),
        clothImage: URL.createObjectURL(clothFile),
        result: imgUrl,
        timestamp: new Date().toLocaleString(),
      };
      setTryOnHistory(prev => [newTryOn, ...prev.slice(0, 4)]); // Keep last 5
      
      toast.success("Tạo ảnh thử đồ thành công! 🎉");
    } catch (err) {
      console.error("API error:", err);
      const errorMessage = err.response?.data?.error || err.message || "Có lỗi xảy ra khi xử lý ảnh";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = result;
    link.download = `virtual-tryon-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã tải ảnh xuống!");
  };

  const handleRetry = () => {
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-2xl shadow-lg">
              <span className="text-4xl">👗</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Virtual Try-On
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm thử đồ ảo với công nghệ AI. Tải lên ảnh của bạn và sản phẩm muốn thử để xem kết quả!
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Person Image Upload */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2">1</span>
                Ảnh của bạn
              </h3>
              {personFile && (
                <button
                  onClick={() => handleRemoveImage("person")}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Xóa
                </button>
              )}
            </div>
            
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                personFile 
                  ? "border-green-400 bg-green-50" 
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
              onClick={() => fileInputRef.current.person?.click()}
            >
              <input
                ref={el => fileInputRef.current.person = el}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "person")}
                className="hidden"
              />
              
              {personFile ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-green-600 font-medium">Đã tải ảnh lên</p>
                  <img
                    src={URL.createObjectURL(personFile)}
                    alt="preview-person"
                    className="w-full h-48 object-cover rounded-lg shadow-md mx-auto"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">📸</span>
                  </div>
                  <p className="text-gray-600 font-medium">Tải ảnh lên</p>
                  <p className="text-sm text-gray-500">Kéo thả hoặc click để chọn ảnh</p>
                  <p className="text-xs text-gray-400">PNG, JPG, JPEG (Tối đa 10MB)</p>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <span className="text-blue-500 mr-2">💡</span>
                Mẹo chụp ảnh tốt nhất:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ảnh rõ nét, ánh sáng tốt</li>
                <li>• Tư thế đứng thẳng, toàn thân</li>
                <li>• Nền trắng hoặc nền đơn giản</li>
                <li>• Mặc đồ bó sát để kết quả chính xác</li>
              </ul>
            </div>
          </div>

          {/* Cloth Image Upload */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-2">2</span>
                Sản phẩm
              </h3>
              {clothFile && (
                <button
                  onClick={() => handleRemoveImage("cloth")}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Xóa
                </button>
              )}
            </div>

            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                clothFile 
                  ? "border-green-400 bg-green-50" 
                  : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
              }`}
              onClick={() => fileInputRef.current.cloth?.click()}
            >
              <input
                ref={el => fileInputRef.current.cloth = el}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "cloth")}
                className="hidden"
              />
              
              {clothFile ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-green-600 font-medium">Đã tải ảnh lên</p>
                  <img
                    src={URL.createObjectURL(clothFile)}
                    alt="preview-cloth"
                    className="w-full h-48 object-cover rounded-lg shadow-md mx-auto"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">👕</span>
                  </div>
                  <p className="text-gray-600 font-medium">Tải ảnh sản phẩm</p>
                  <p className="text-sm text-gray-500">Kéo thả hoặc click để chọn ảnh</p>
                  <p className="text-xs text-gray-400">PNG, JPG, JPEG (Tối đa 10MB)</p>
                </div>
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={() => navigate('/products')}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="mr-2">🛍️</span>
                Mua sắm sản phẩm
              </button>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-2">3</span>
              Kết quả
            </h3>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 min-h-80 flex items-center justify-center">
              {loading ? (
                <div className="text-center space-y-4 w-full">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                    <div 
                      className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
                      style={{ animationDuration: '1s' }}
                    ></div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-700">Đang xử lý ảnh...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500">{progress}% hoàn thành</p>
                  </div>
                </div>
              ) : result ? (
                <div className="text-center space-y-4 w-full">
                  <img
                    src={result}
                    alt="virtual-tryon-result"
                    className="w-full h-64 object-cover rounded-lg shadow-lg mx-auto"
                  />
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleDownload}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center"
                    >
                      <span className="mr-2">📥</span>
                      Tải xuống
                    </button>
                    <button
                      onClick={handleRetry}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center"
                    >
                      <span className="mr-2">🔄</span>
                      Thử lại
                    </button>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center space-y-3 text-red-600">
                  <div className="text-4xl">😞</div>
                  <p className="font-medium">Có lỗi xảy ra</p>
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    Thử lại
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-3 text-gray-500">
                  <div className="text-4xl">✨</div>
                  <p className="font-medium">Kết quả sẽ hiển thị ở đây</p>
                  <p className="text-sm">Chọn đủ 2 ảnh và nhấn "Tạo ảnh"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-12">
          <button
            onClick={handleGenerate}
            disabled={!personFile || !clothFile || loading}
            className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
              !personFile || !clothFile || loading
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:scale-105 shadow-2xl hover:shadow-3xl"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-3">🎨</span>
                Tạo Ảnh Thử Đồ
              </span>
            )}
          </button>
        </div>

        {/* Try-On History */}
        {tryOnHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📚</span>
              Lịch sử thử đồ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {tryOnHistory.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <img
                    src={item.result}
                    alt={`try-on-result-${item.id}`}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <p className="text-xs text-gray-500 text-center">{item.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="font-semibold text-gray-900 mb-2">Xử lý nhanh chóng</h4>
            <p className="text-gray-600 text-sm">AI xử lý ảnh trong vài giây với công nghệ tiên tiến</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🛡️</div>
            <h4 className="font-semibold text-gray-900 mb-2">Bảo mật dữ liệu</h4>
            <p className="text-gray-600 text-sm">Ảnh của bạn được xử lý an toàn và không lưu trữ</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-semibold text-gray-900 mb-2">Kết quả chính xác</h4>
            <p className="text-gray-600 text-sm">Tỷ lệ phù hợp cao với công nghệ AI hiện đại</p>
          </div>
        </div>
      </div>
    </div>
  );
}