// admin/pages/Manage/AddFlashSaleProducts.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import ProductSearchSelect from "@/admin/components/common/ProductSearchSelect.jsx";
import { addProductToFlashSale, getFlashSaleDetail } from "@/services/adminService.jsx";
import PageMeta from "@/admin/components/common/PageMeta.jsx";
import PageBreadcrumb from "@/admin/components/common/PageBreadCrumb.jsx";

const AddFlashSaleProducts = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [flashSale, setFlashSale] = useState(null);
    const [products, setProducts] = useState([{
        product_id: "",
        flash_price: "",
        original_price: "",
        stock_flash_sale: "",
        limit_per_user: 1,
        sort_order: 0
    }]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const formatCurrency = (value) => {
        if (!value) return "";
        return value.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Hàm chuyển đổi từ chuỗi định dạng về số
    const parseCurrency = (value) => {
        return parseInt(value.replace(/\./g, "")) || 0;
    };
    useEffect(() => {
        const fetchFlashSaleDetail = async () => {
            try {
                const res = await getFlashSaleDetail(id);
                if (res && res.success) {
                    setFlashSale(res.data);
                } else {
                    toast.error("Không tìm thấy flash sale");
                    navigate("/admin/manage-flashsales");
                }
            } catch (error) {
                toast.error("Lỗi khi tải thông tin flash sale");
                navigate("/admin/manage-flashsales");
            } finally {
                setPageLoading(false);
            }
        };

        if (id) {
            fetchFlashSaleDetail();
        }
    }, [id, navigate]);

    const addProductRow = () => {
        setProducts(prev => [...prev, {
            product_id: "",
            flash_price: "",
            original_price: "",
            stock_flash_sale: "",
            limit_per_user: 1,
            sort_order: prev.length
        }]);
        toast.success("Đã thêm dòng sản phẩm mới");
    };

    const removeProductRow = (index) => {
        if (products.length > 1) {
            setProducts(prev => prev.filter((_, i) => i !== index));
            toast.success(`Đã xóa sản phẩm #${index + 1}`);
        } else {
            toast.error("Phải có ít nhất 1 sản phẩm");
        }
    };

    const updateProduct = (index, field, value) => {
        setProducts(prev => prev.map((product, i) => {
            if (i === index) {
                // 🎯 NẾU LÀ product_id VÀ VALUE LÀ OBJECT (TỪ ProductSearchSelect)
                if (field === "product_id" && typeof value === 'object') {
                    return {
                        ...product,
                        product_id: value.product_id,
                        available_stock: value.available_stock, // Lưu available_stock
                        original_price: Math.floor(value.original_price),
                    };
                }
                return { ...product, [field]: value };
            }
            return product;
        }));
    };

    const validateProducts = () => {
        if (products.length === 0) {
            toast.error("Vui lòng thêm ít nhất 1 sản phẩm");
            return false;
        }

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const productNum = i + 1;

            // Kiểm tra Product ID
            if (!product.product_id || !product.product_id.toString().trim()) {
                toast.error(`Sản phẩm #${productNum}: Vui lòng chọn sản phẩm`);
                return false;
            }

            // Kiểm tra giá gốc
            if (!product.original_price || !product.original_price.toString().trim()) {
                toast.error(`Sản phẩm #${productNum}: Vui lòng nhập giá gốc`);
                return false;
            }

            const originalPrice = parseFloat(product.original_price);
            if (isNaN(originalPrice) || originalPrice <= 0) {
                toast.error(`Sản phẩm #${productNum}: Giá gốc phải lớn hơn 0`);
                return false;
            }

            // Kiểm tra giá flash sale
            if (!product.flash_price || !product.flash_price.toString().trim()) {
                toast.error(`Sản phẩm #${productNum}: Vui lòng nhập giá flash sale`);
                return false;
            }

            const flashPrice = parseFloat(product.flash_price);
            if (isNaN(flashPrice) || flashPrice <= 0) {
                toast.error(`Sản phẩm #${productNum}: Giá flash sale phải lớn hơn 0`);
                return false;
            }

            // So sánh giá
            if (flashPrice >= originalPrice) {
                toast.error(
                    `Sản phẩm #${productNum}: Giá flash sale (${formatCurrency(flashPrice)}đ) phải nhỏ hơn giá gốc (${formatCurrency(originalPrice)}đ)`,
                    { duration: 5000 }
                );
                return false;
            }
            // Kiểm tra số lượng kho
            if (!product.stock_flash_sale || !product.stock_flash_sale.toString().trim()) {
                toast.error(`Sản phẩm #${productNum}: Vui lòng nhập số lượng kho`);
                return false;
            }

            const stock = parseInt(product.stock_flash_sale);
            if (isNaN(stock) || stock <= 0) {
                toast.error(`Sản phẩm #${productNum}: Số lượng kho phải lớn hơn 0`);
                return false;
            }

            if (stock > 100000) {
                toast.error(`Sản phẩm #${productNum}: Số lượng kho quá lớn (tối đa 100,000)`);
                return false;
            }

            // 🎯 KIỂM TRA SỐ LƯỢNG FLASH SALE KHÔNG VƯỢT QUÁ TỒN KHO THỰC TẾ
            // (Cần có thông tin inventory từ ProductSearchSelect)
            if (product.available_stock !== undefined && stock > product.available_stock) {
                toast.error(
                    `Sản phẩm #${productNum}: Số lượng flash sale (${stock}) không được lớn hơn tồn kho thực tế (${product.available_stock})`,
                    { duration: 5000 }
                );
                return false;
            }

            // Kiểm tra giới hạn mua/user
            const limitPerUser = parseInt(product.limit_per_user);
            if (isNaN(limitPerUser) || limitPerUser < 1) {
                toast.error(`Sản phẩm #${productNum}: Giới hạn/user phải ít nhất là 1`);
                return false;
            }

            if (limitPerUser > stock) {
                toast.error(
                    `Sản phẩm #${productNum}: Giới hạn/user (${limitPerUser}) không được lớn hơn số lượng kho (${stock})`,
                    { duration: 5000 }
                );
                return false;
            }

            if (limitPerUser > 100) {
                toast.error(`Sản phẩm #${productNum}: Giới hạn/user quá lớn (tối đa 100)`);
                return false;
            }
        }

        // Kiểm tra trùng Product ID trong form hiện tại
        const productIds = products.map(p => parseInt(p.product_id));
        const uniqueIds = new Set(productIds);
        if (uniqueIds.size !== productIds.length) {
            const duplicates = productIds.filter((id, index) => productIds.indexOf(id) !== index);
            toast.error(
                `Phát hiện Product ID trùng lặp trong form: ${[...new Set(duplicates)].join(', ')}. Mỗi sản phẩm chỉ được thêm 1 lần`,
                { duration: 5000 }
            );
            return false;
        }

        // 🎯 KIỂM TRA TRÙNG VỚI SẢN PHẨM ĐÃ CÓ TRONG FLASH SALE
        if (flashSale && flashSale.products && flashSale.products.length > 0) {
            const existingProductIds = flashSale.products.map(p => parseInt(p.product_id));
            const duplicateWithExisting = productIds.filter(id => existingProductIds.includes(id));

            if (duplicateWithExisting.length > 0) {
                toast.error(
                    `Sản phẩm đã tồn tại trong flash sale: ${duplicateWithExisting.join(', ')}. Vui lòng chọn sản phẩm khác`,
                    { duration: 5000 }
                );
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateProducts()) {
            return;
        }

        const validProducts = products.map(product => ({
            product_id: parseInt(product.product_id),
            flash_price: parseFloat(product.flash_price),
            original_price: parseFloat(product.original_price),
            stock_flash_sale: parseInt(product.stock_flash_sale),
            limit_per_user: parseInt(product.limit_per_user),
            sort_order: parseInt(product.sort_order)
        }));

        setLoading(true);
        try {
            const res = await addProductToFlashSale(id, { products: validProducts });
            if (res && res.success) {
                toast.success(`✅ Đã thêm ${products.length} sản phẩm vào flash sale thành công!`);
                navigate(`/admin/manage-flashsales`);
            } else {
                // 🎯 THÊM XỬ LÝ KHI API TRẢ VỀ success: false
                toast.error(res?.message || "Có lỗi xảy ra khi thêm sản phẩm");
            }
        } catch (error) {
            // 🎯 SỬA LẠI PHẦN NÀY ĐỂ HIỂN THỊ LỖI TỪ BACKEND
            console.error("API Error:", error);

            if (error.message) {
                // Hiển thị message cụ thể từ backend
                toast.error(error.message);
            } else if (error.response?.data?.message) {
                // Hiển thị message từ response
                toast.error(error.response.data.message);
            } else {
                // Message mặc định
                toast.error("Có lỗi xảy ra khi thêm sản phẩm");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(`/admin/manage-flashsales`);
    };

    if (pageLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <PageMeta title={`Admin UTE Shop | Thêm sản phẩm - ${flashSale?.name}`} />
            <PageBreadcrumb
                pageTitle={`Thêm sản phẩm - ${flashSale?.name}`}
                links={[
                    { title: "Quản lý Flash Sale", path: "/admin/manage-flashsales" },
                    { title: `Thêm sản phẩm - ${flashSale?.name}` }
                ]}
            />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
                            <span className="text-3xl">🛍️</span>
                            Thêm sản phẩm vào Flash Sale
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {flashSale?.name} |
                            Thời gian: {new Date(flashSale?.start_time).toLocaleString('vi-VN')} - {new Date(flashSale?.end_time).toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-2 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                        ← Quay lại
                    </button>
                </div>

                {/* Hướng dẫn */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>💡 Lưu ý:</strong> Giá flash sale phải nhỏ hơn giá gốc.
                        Mỗi sản phẩm chỉ được thêm 1 lần. Giới hạn/user không được lớn hơn số lượng kho.
                    </p>
                </div>

                {/* Form - ĐÃ THÊM ĐẦY ĐỦ CÁC INPUT */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {products.map((product, index) => (
                            <div key={index} className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-r from-gray-50 to-white hover:border-blue-300 transition-colors">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                        <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                                            {index + 1}
                                        </span>
                                        Sản phẩm #{index + 1}
                                    </h3>
                                    {products.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeProductRow(index)}
                                            className="px-3 py-1.5 text-sm text-red-600 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium"
                                            disabled={loading}
                                        >
                                            🗑️ Xóa
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* 🎯 SẢN PHẨM */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Sản phẩm <span className="text-red-500">*</span>
                                        </label>
                                        <ProductSearchSelect
                                            value={product.product_id}
                                            onChange={(productId) => updateProduct(index, "product_id", productId)}
                                            disabled={loading}
                                            placeholder="Nhập tên sản phẩm để tìm kiếm..."
                                        />
                                    </div>

                                    {/* 🎯 GIÁ GỐC */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Giá gốc (VNĐ) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={product.original_price ? formatCurrency(product.original_price) : ""}
                                            onChange={(e) => {
                                                const numericValue = parseCurrency(e.target.value);
                                                updateProduct(index, "original_price", numericValue);
                                            }}
                                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="500.000"
                                            disabled={loading}
                                        />
                                        {product.original_price && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatCurrency(product.original_price)}đ
                                            </p>
                                        )}
                                    </div>

                                    {/* 🎯 GIÁ FLASH SALE */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Giá Flash Sale (VNĐ) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={product.flash_price ? formatCurrency(product.flash_price) : ""}
                                            onChange={(e) => {
                                                const numericValue = parseCurrency(e.target.value);
                                                updateProduct(index, "flash_price", numericValue);
                                            }}
                                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="199.000"
                                            disabled={loading}
                                        />
                                        {product.flash_price && product.original_price && (
                                            <p className="text-xs text-green-600 mt-1 font-medium">
                                                {formatCurrency(product.flash_price)}đ
                                                {product.flash_price < product.original_price && (
                                                    <span className="ml-1">
                                                        (Giảm {(((product.original_price - product.flash_price) / product.original_price) * 100).toFixed(0)}%)
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    {/* 🎯 SỐ LƯỢNG KHO */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Số lượng flash sale <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={product.stock_flash_sale}
                                            onChange={(e) => updateProduct(index, "stock_flash_sale", e.target.value)}
                                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="100"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* 🎯 GIỚI HẠN/USER */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Giới hạn/user <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={product.limit_per_user}
                                            onChange={(e) => updateProduct(index, "limit_per_user", e.target.value)}
                                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="2"
                                            min="1"
                                            disabled={loading}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Mỗi user mua tối đa bao nhiêu
                                        </p>
                                    </div>

                                    {/* 🎯 THỨ TỰ HIỂN THỊ */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Thứ tự hiển thị
                                        </label>
                                        <input
                                            type="number"
                                            value={product.sort_order}
                                            onChange={(e) => updateProduct(index, "sort_order", e.target.value)}
                                            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="0"
                                            disabled={loading}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Số càng nhỏ hiển thị càng trước
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer buttons */}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t">
                        <button
                            type="button"
                            onClick={addProductRow}
                            className="px-6 py-3 text-blue-600 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                            disabled={loading || products.length >= 50}
                        >
                            + Thêm sản phẩm khác
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={loading}
                            >
                                {loading && (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                {loading ? "Đang xử lý..." : `✅ Thêm ${products.length} sản phẩm`}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddFlashSaleProducts;