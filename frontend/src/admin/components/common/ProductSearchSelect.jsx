// components/ProductSearchSelect.jsx
import { useState, useEffect, useRef } from "react";
import { searchProducts } from "@/services/adminService.jsx";
import { toast } from "react-toastify";

const ProductSearchSelect = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Tìm kiếm sản phẩm...",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const dropdownRef = useRef(null);

  // Tìm kiếm sản phẩm
  const searchProductsHandler = async (term) => {
    if (!term.trim()) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await searchProducts(term);
      console.log("🔍 API Response:", res); // Debug

      if (res && res.success) {
        setProducts(res.data || []);
      } else {
        setProducts([]);
        if (searchTerm.trim()) {
          toast.error("Không tìm thấy sản phẩm nào");
        }
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      toast.error("Lỗi khi tìm kiếm sản phẩm");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchProductsHandler(searchTerm);
      } else {
        setProducts([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Khi có value từ props, tìm product tương ứng
  useEffect(() => {
    if (value && products.length > 0) {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        setSelectedProduct(product);
        setSearchTerm(product.name);
      }
    }
  }, [value, products]);

  const handleSelectProduct = (product) => {
    console.log("🎯 Selected product:", product);
    setSelectedProduct(product);
    setSearchTerm(product.name);

    // 🎯 GỬI CẢ THÔNG TIN SẢN PHẨM ĐẦY ĐỦ VỀ PARENT
    onChange({
      product_id: product.id.toString(),
      available_stock: product.available_stock, // Gửi kèm available_stock
      original_price: Math.floor(product.price)
    });
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setSelectedProduct(null);
      onChange("");
    }

    setIsOpen(true);
  };

  const clearSelection = () => {
    setSearchTerm("");
    setSelectedProduct(null);
    onChange("");
    setIsOpen(false);
    setProducts([]);
  };

  // Component hiển thị ảnh với fallback
  const ProductImage = ({ product, className = "" }) => {
    const [imgError, setImgError] = useState(false);

    return (
      <div className={`relative ${className}`}>
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.image_alt || product.name}
            className="w-full h-full object-cover rounded border"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded border flex items-center justify-center text-gray-500">
            📦
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
          placeholder={placeholder}
          disabled={disabled}
        />

        {/* Clear button */}
        {searchTerm && !disabled && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Xóa tìm kiếm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              Đang tìm kiếm...
            </div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors ${selectedProduct?.id === product.id ? "bg-blue-50 border-blue-200" : ""
                  }`}
              >
                <div className="flex items-center gap-3">
                  {/* Product Image */}
                  <ProductImage
                    product={product}
                    className="w-10 h-10 flex-shrink-0"
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {product.name}
                      </h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                        #{product.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm font-semibold text-green-600">
                        {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                      </span>

                      <span className={`text-xs px-1.5 py-0.5 rounded ${product.in_stock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}>
                        {product.in_stock ? `Còn ${product.available_stock} sp` : "Hết hàng"}
                      </span>
                    </div>

                    {product.category && (
                      <p className="text-xs text-gray-500 mt-1">
                        📁 {product.category.name}
                      </p>
                    )}

                    {/* Hiển thị view count nếu có */}
                    {product.view_count > 0 && (
                      <p className="text-xs text-gray-500">
                        👁️ {product.view_count} lượt xem
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : searchTerm && !isLoading ? (
            <div className="px-4 py-4 text-sm text-gray-500 text-center">
              <div className="text-2xl mb-1">😞</div>
              Không tìm thấy sản phẩm "{searchTerm}"
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              🔍 Nhập tên sản phẩm để tìm kiếm
            </div>
          )}
        </div>
      )}

      {/* Selected product info */}
      {selectedProduct && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <ProductImage
              product={selectedProduct}
              className="w-12 h-12 flex-shrink-0"
            />
            <div className="flex-1">
              <p className="font-medium text-green-800 text-sm">
                ✅ Đã chọn: {selectedProduct.name}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-xs text-green-600 font-medium">
                  💰 Giá: {new Intl.NumberFormat('vi-VN').format(selectedProduct.price)}đ
                </span>
                <span className="text-xs text-green-600">
                  🆔 ID: #{selectedProduct.id}
                </span>
                <span className="text-xs text-green-600">
                  📦 Tồn: {selectedProduct.available_stock} sp
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${selectedProduct.in_stock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                  {selectedProduct.in_stock ? "🟢 Còn hàng" : "🔴 Hết hàng"}
                </span>
              </div>
              {/* 🎯 THÊM THÔNG BÁO AUTO-FILL */}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearchSelect;