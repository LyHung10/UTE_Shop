import PageMeta from "@/admin/components/common/PageMeta.jsx";
import PageBreadcrumb from "@/admin/components/common/PageBreadCrumb.jsx";
import { useState, useEffect } from "react";
import { createFlashSale, getAllFlashSales } from "@/services/adminService.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ProductSearchSelect from "@/admin/components/common/ProductSearchSelect.jsx";

const CreateFlashSale = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [existingFlashSales, setExistingFlashSales] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        start_time: "",
        end_time: "",
        banner_image: "",
    });
    const [products, setProducts] = useState([{
        product_id: "",
        flash_price: "",
        original_price: "",
        stock_flash_sale: "",
        limit_per_user: 1,
        sort_order: 0
    }]);

    // Hàm định dạng số tiền
    const formatCurrency = (value) => {
        if (!value) return "";
        return value.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Hàm chuyển đổi từ chuỗi định dạng về số
    const parseCurrency = (value) => {
        return parseInt(value.replace(/\./g, "")) || 0;
    };

    useEffect(() => {
        const loadExistingFlashSales = async () => {
            try {
                const res = await getAllFlashSales();
                if (res && res.success) {
                    setExistingFlashSales(res.data || []);
                }
            } catch (error) {
                console.error("Error loading flash sales:", error);
            }
        };
        loadExistingFlashSales();
    }, []);

    const validateTimeOverlap = (startTime, endTime) => {
        const newStart = new Date(startTime);
        const newEnd = new Date(endTime);

        for (const flashSale of existingFlashSales) {
            const existingStart = new Date(flashSale.start_time);
            const existingEnd = new Date(flashSale.end_time);

            if (
                (newStart >= existingStart && newStart < existingEnd) ||
                (newEnd > existingStart && newEnd <= existingEnd) ||
                (newStart <= existingStart && newEnd >= existingEnd)
            ) {
                return {
                    isValid: false,
                    conflictWith: flashSale.name,
                    conflictPeriod: `${new Date(flashSale.start_time).toLocaleString('vi-VN')} - ${new Date(flashSale.end_time).toLocaleString('vi-VN')}`
                };
            }
        }

        return { isValid: true };
    };

    const validateProductOverlap = (productIds) => {
        const activeOrUpcomingFlashSales = existingFlashSales.filter(
            fs => fs.status === 'active' || fs.status === 'upcoming'
        );

        const conflicts = [];

        for (const productId of productIds) {
            for (const flashSale of activeOrUpcomingFlashSales) {
                if (flashSale.products && flashSale.products.some(p => p.product_id == productId)) {
                    conflicts.push({
                        productId,
                        flashSaleName: flashSale.name,
                        period: `${new Date(flashSale.start_time).toLocaleString('vi-VN')} - ${new Date(flashSale.end_time).toLocaleString('vi-VN')}`
                    });
                    break;
                }
            }
        }

        if (conflicts.length > 0) {
            return { isValid: false, conflicts };
        }

        return { isValid: true };
    };

    const handleTimeChange = async (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'end_time' && formData.start_time && value) {
            setChecking(true);
            try {
                const timeValidation = validateTimeOverlap(formData.start_time, value);
                if (!timeValidation.isValid) {
                    toast.error(
                        `⚠️ Thời gian bị trùng với "${timeValidation.conflictWith}"\n${timeValidation.conflictPeriod}`,
                        { duration: 5000 }
                    );
                } else {
                    toast.success("✅ Thời gian hợp lệ, không trùng lặp");
                }
            } finally {
                setChecking(false);
            }
        }
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addProductRow = () => {
        if (products.length >= 50) {
            toast.error("Không thể thêm quá 50 sản phẩm");
            return;
        }
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

    // Sửa hàm updateProduct để auto-fill original_price
    const updateProduct = (index, field, value) => {
        setProducts(prev => prev.map((product, i) => {
            if (i === index) {
                // 🎯 NẾU LÀ product_id VÀ CÓ GIÁ TỪ PRODUCT SEARCH
                if (field === "product_id" && typeof value === 'object' && value.original_price) {
                    return {
                        ...product,
                        product_id: value.product_id,
                        original_price: Math.floor(value.original_price),
                        available_stock: value.available_stock
                    };
                }
                return { ...product, [field]: value };
            }
            return product;
        }));
    };

    const validateBasicInfo = () => {
        if (!formData.name?.trim()) {
            toast.error("❌ Vui lòng nhập tên Flash Sale");
            return false;
        }

        if (formData.name.trim().length < 5) {
            toast.error("❌ Tên Flash Sale phải có ít nhất 5 ký tự");
            return false;
        }

        if (formData.name.trim().length > 200) {
            toast.error("❌ Tên Flash Sale không được vượt quá 200 ký tự");
            return false;
        }

        if (!formData.start_time) {
            toast.error("❌ Vui lòng chọn thời gian bắt đầu");
            return false;
        }

        const startTime = new Date(formData.start_time);
        const now = new Date();

        if (startTime < now) {
            const confirm = window.confirm(
                "⚠️ Thời gian bắt đầu đã qua. Flash sale sẽ có trạng thái 'ended' ngay sau khi tạo. Bạn có chắc muốn tiếp tục?"
            );
            if (!confirm) return false;
        }

        if (!formData.end_time) {
            toast.error("❌ Vui lòng chọn thời gian kết thúc");
            return false;
        }

        const endTime = new Date(formData.end_time);

        if (endTime <= startTime) {
            toast.error("❌ Thời gian kết thúc phải sau thời gian bắt đầu");
            return false;
        }

        const duration = (endTime - startTime) / (1000 * 60 * 60);
        if (duration < 1) {
            toast.error("❌ Flash sale phải kéo dài ít nhất 1 giờ");
            return false;
        }

        if (duration > 720) {
            const confirm = window.confirm(
                "⚠️ Flash sale kéo dài hơn 30 ngày. Bạn có chắc chắn không?"
            );
            if (!confirm) return false;
        }

        const timeValidation = validateTimeOverlap(formData.start_time, formData.end_time);
        if (!timeValidation.isValid) {
            toast.error(
                `❌ Thời gian trùng với Flash Sale: "${timeValidation.conflictWith}"\n📅 ${timeValidation.conflictPeriod}`,
                { duration: 6000 }
            );
            return false;
        }

        if (formData.banner_image?.trim()) {
            try {
                new URL(formData.banner_image);
            } catch {
                toast.error("❌ Banner image URL không hợp lệ");
                return false;
            }
        }

        return true;
    };

    const validateProducts = () => {
        const filledProducts = products.filter(p =>
            p.product_id?.toString().trim() ||
            p.flash_price?.toString().trim() ||
            p.original_price?.toString().trim() ||
            p.stock_flash_sale?.toString().trim()
        );

        if (filledProducts.length === 0) {
            toast.error("❌ Vui lòng thêm ít nhất 1 sản phẩm");
            return false;
        }

        const validProducts = [];
        const productIds = new Set();

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const productNum = i + 1;

            const isEmpty = !product.product_id?.toString().trim() &&
                !product.flash_price?.toString().trim() &&
                !product.original_price?.toString().trim() &&
                !product.stock_flash_sale?.toString().trim();

            if (isEmpty) continue;

            if (!product.product_id?.toString().trim()) {
                toast.error(`❌ Sản phẩm #${productNum}: Thiếu Product ID`);
                return false;
            }

            const productId = parseInt(product.product_id);
            if (isNaN(productId) || productId <= 0) {
                toast.error(`❌ Sản phẩm #${productNum}: Product ID phải là số nguyên dương`);
                return false;
            }

            if (productIds.has(productId)) {
                toast.error(`❌ Sản phẩm #${productNum}: Product ID ${productId} đã được thêm trước đó`);
                return false;
            }
            productIds.add(productId);

            if (!product.original_price?.toString().trim()) {
                toast.error(`❌ Sản phẩm #${productNum}: Thiếu giá gốc`);
                return false;
            }

            const originalPrice = parseFloat(product.original_price);
            if (isNaN(originalPrice) || originalPrice <= 0) {
                toast.error(`❌ Sản phẩm #${productNum}: Giá gốc phải lớn hơn 0`);
                return false;
            }

            if (originalPrice > 1000000000) {
                toast.error(`❌ Sản phẩm #${productNum}: Giá gốc quá cao (tối đa 1 tỷ)`);
                return false;
            }

            if (!product.flash_price?.toString().trim()) {
                toast.error(`❌ Sản phẩm #${productNum}: Thiếu giá flash sale`);
                return false;
            }

            const flashPrice = parseFloat(product.flash_price);
            if (isNaN(flashPrice) || flashPrice <= 0) {
                toast.error(`❌ Sản phẩm #${productNum}: Giá flash sale phải lớn hơn 0`);
                return false;
            }

            if (flashPrice >= originalPrice) {
                toast.error(
                    `❌ Sản phẩm #${productNum}: Giá flash sale (${formatCurrency(flashPrice)}đ) phải nhỏ hơn giá gốc (${formatCurrency(originalPrice)}đ)`,
                    { duration: 5000 }
                );
                return false;
            }

            const discountPercent = ((originalPrice - flashPrice) / originalPrice) * 100;
            if (discountPercent > 95) {
                toast.error(
                    `❌ Sản phẩm #${productNum}: Giảm giá ${discountPercent.toFixed(0)}% là quá cao (tối đa 95%). Có thể bạn nhập sai giá?`,
                    { duration: 6000 }
                );
                return false;
            }

            if (discountPercent < 1) {
                toast.error(
                    `❌ Sản phẩm #${productNum}: Giảm giá chỉ ${discountPercent.toFixed(1)}% là quá thấp. Flash sale nên giảm ít nhất 1%`,
                    { duration: 5000 }
                );
                return false;
            }

            if (!product.stock_flash_sale?.toString().trim()) {
                toast.error(`❌ Sản phẩm #${productNum}: Thiếu số lượng kho`);
                return false;
            }

            const stock = parseInt(product.stock_flash_sale);
            if (isNaN(stock) || stock <= 0) {
                toast.error(`❌ Sản phẩm #${productNum}: Số lượng kho phải lớn hơn 0`);
                return false;
            }
            if (product.available_stock !== undefined && stock > product.available_stock) {
                toast.error(
                    `❌ Sản phẩm #${productNum}: Số lượng flash sale (${stock}) vượt quá tồn kho thực tế (${product.available_stock})`,
                    { duration: 5000 }
                );
                return false;
            }
            if (stock > 100000) {
                toast.error(`❌ Sản phẩm #${productNum}: Số lượng kho quá lớn (tối đa 100,000)`);
                return false;
            }

            const limitPerUser = parseInt(product.limit_per_user);
            if (isNaN(limitPerUser) || limitPerUser < 1) {
                toast.error(`❌ Sản phẩm #${productNum}: Giới hạn/user phải ít nhất là 1`);
                return false;
            }

            if (limitPerUser > stock) {
                toast.error(
                    `❌ Sản phẩm #${productNum}: Giới hạn/user (${limitPerUser}) không được lớn hơn kho (${stock})`,
                    { duration: 5000 }
                );
                return false;
            }

            if (limitPerUser > 100) {
                toast.error(`❌ Sản phẩm #${productNum}: Giới hạn/user quá lớn (tối đa 100)`);
                return false;
            }

            const sortOrder = parseInt(product.sort_order);
            if (isNaN(sortOrder) || sortOrder < 0) {
                toast.error(`❌ Sản phẩm #${productNum}: Thứ tự phải từ 0 trở lên`);
                return false;
            }

            validProducts.push({
                product_id: productId,
                flash_price: flashPrice,
                original_price: originalPrice,
                stock_flash_sale: stock,
                limit_per_user: limitPerUser,
                sort_order: sortOrder
            });
        }

        if (validProducts.length === 0) {
            toast.error("❌ Không có sản phẩm hợp lệ nào");
            return false;
        }

        const productIdList = validProducts.map(p => p.product_id);
        const productValidation = validateProductOverlap(productIdList);

        if (!productValidation.isValid) {
            const conflictDetails = productValidation.conflicts
                .map(c => `  • Sản phẩm ID ${c.productId}: đang trong "${c.flashSaleName}"`)
                .join('\n');

            toast.error(
                `❌ Phát hiện sản phẩm đã tham gia Flash Sale khác:\n${conflictDetails}\n\nVui lòng chọn sản phẩm khác hoặc xóa khỏi Flash Sale cũ`,
                { duration: 8000 }
            );
            return false;
        }

        return validProducts;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateBasicInfo()) {
            return;
        }

        const validProducts = validateProducts();
        if (!validProducts) {
            return;
        }

        if (!window.confirm("Bạn có chắc chắn muốn tạo Flash Sale này?")) {
            toast.info("Đã hủy tạo Flash Sale");
            return;
        }

        setLoading(true);

        try {
            const submitData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                start_time: formData.start_time,
                end_time: formData.end_time,
                banner_image: formData.banner_image.trim() || "https://via.placeholder.com/800x400",
                products: validProducts
            };

            const res = await createFlashSale(submitData);

            if (res && res.success) {
                toast.success("🎉 Tạo Flash Sale thành công!");
                setTimeout(() => {
                    navigate("/admin/manage-flashsales");
                }, 1000);
            } else {
                toast.error(res?.message || "❌ Có lỗi xảy ra khi tạo Flash Sale");
            }
        } catch (error) {
            console.error("API Error:", error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Lỗi kết nối đến server";
            toast.error(`❌ ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const renderExistingFlashSales = () => {
        const activeOrUpcoming = existingFlashSales.filter(
            fs => fs.status === 'active' || fs.status === 'upcoming'
        );

        if (activeOrUpcoming.length === 0) return null;

        return (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    Flash Sale đang hoạt động/sắp diễn ra ({activeOrUpcoming.length})
                </h4>
                <div className="space-y-2 text-sm">
                    {activeOrUpcoming.map(fs => (
                        <div key={fs.id} className="flex justify-between items-center bg-white p-2 rounded border">
                            <span className="font-medium">{fs.name}</span>
                            <span className="text-blue-600 text-xs">
                                {new Date(fs.start_time).toLocaleString('vi-VN')} → {new Date(fs.end_time).toLocaleString('vi-VN')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const fillTestData = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);

        const endDate = new Date(tomorrow);
        endDate.setHours(12, 0, 0, 0);

        const startTime = tomorrow.toISOString().slice(0, 16);
        const endTime = endDate.toISOString().slice(0, 16);

        setFormData({
            name: "Flash Sale Test " + new Date().getTime(),
            description: "Đây là flash sale test",
            start_time: startTime,
            end_time: endTime,
            banner_image: "https://via.placeholder.com/800x400",
        });

        setProducts([{
            product_id: "1",
            flash_price: "199000",
            original_price: "499000",
            stock_flash_sale: "50",
            limit_per_user: 2,
            sort_order: 0
        }]);

        toast.success("✅ Đã điền dữ liệu test");
    };

    return (
        <>
            <PageMeta title="Admin UTE Shop | Tạo Flash Sale" />
            <PageBreadcrumb
                pageTitle="Tạo Flash Sale Mới"
                links={[
                    { label: "Quản lý Flash Sale", path: "/admin/manage-flashsales" },
                    { label: "Tạo mới" }
                ]}
            />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">

                {renderExistingFlashSales()}

                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                        <span className="text-xl">📌</span>
                        Quy tắc tạo Flash Sale
                    </h4>
                    <ul className="text-sm text-green-700 space-y-2">
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Không được trùng thời gian với Flash Sale khác</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Sản phẩm không được tham gia nhiều Flash Sale cùng lúc</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Giá flash sale phải nhỏ hơn giá gốc và giảm từ 1% đến 95%</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Flash sale phải kéo dài ít nhất 1 giờ</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Giới hạn/user không được vượt quá số lượng kho</span>
                        </li>
                    </ul>
                </div>
                <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <button
                        type="button"
                        onClick={fillTestData}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                        disabled={loading}
                    >
                        🧪 Fill Test Data
                    </button>
                    <p className="text-xs text-yellow-700 mt-1">
                        Dùng để test nhanh - mở Console (F12) để xem chi tiết
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* PHẦN THÔNG TIN FLASH SALE - ĐÃ SỬA LỖI */}
                    <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-r from-gray-50 to-white">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-4 flex items-center gap-2">
                            <span className="text-2xl">📋</span>
                            Thông tin Flash Sale
                        </h3>

                        <div className="space-y-4">
                            {/* ĐÃ CHUYỂN INPUT TÊN FLASH SALE VỀ ĐÂY */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Tên Flash Sale <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleFormChange("name", e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="Ví dụ: Flash Sale Tết 2025"
                                    disabled={loading}
                                    maxLength={200}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.name.length}/200 ký tự (tối thiểu 5 ký tự)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleFormChange("description", e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="Mô tả về chương trình flash sale..."
                                    disabled={loading}
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.description.length}/500 ký tự
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Thời gian bắt đầu <span className="text-red-500">*</span>
                                        {checking && <span className="ml-2 text-blue-500 text-xs">🔄 Đang kiểm tra...</span>}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.start_time}
                                        onChange={(e) => handleTimeChange("start_time", e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Thời gian kết thúc <span className="text-red-500">*</span>
                                        {checking && <span className="ml-2 text-blue-500 text-xs">🔄 Đang kiểm tra...</span>}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.end_time}
                                        onChange={(e) => handleTimeChange("end_time", e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {formData.start_time && formData.end_time && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        ⏱️ Thời lượng: {Math.round((new Date(formData.end_time) - new Date(formData.start_time)) / (1000 * 60 * 60))} giờ
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Banner Image URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.banner_image}
                                    onChange={(e) => handleFormChange("banner_image", e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="https://example.com/banner.jpg"
                                    disabled={loading}
                                />
                            </div>

                            {formData.banner_image && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Preview Banner
                                    </label>
                                    <img
                                        src={formData.banner_image}
                                        alt="Banner preview"
                                        className="w-full h-40 object-cover rounded-lg border-2"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PHẦN SẢN PHẨM - GIỮ NGUYÊN */}
                    <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
                                <span className="text-2xl">🛍️</span>
                                Sản phẩm tham gia
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {products.map((product, index) => (
                                <div key={index} className="border-2 border-gray-200 rounded-xl p-5 bg-white hover:border-blue-300 transition-colors">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-lg flex items-center gap-2">
                                            <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                                                {index + 1}
                                            </span>
                                            Sản phẩm #{index + 1}
                                        </h4>
                                        {products.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeProductRow(index)}
                                                className="px-3 py-1.5 text-sm text-red-600 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-colors font-semibold"
                                                disabled={loading}
                                            >
                                                🗑️ Xóa
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
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
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
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

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
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
                                                            (-{(((product.original_price - product.flash_price) / product.original_price) * 100).toFixed(0)}%)
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Số lượng kho <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={product.stock_flash_sale}
                                                onChange={(e) => updateProduct(index, "stock_flash_sale", e.target.value)}
                                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder="100"
                                                min="1"
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
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
                                                Mỗi user mua tối đa
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
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
                                                Số nhỏ hiển thị trước
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addProductRow}
                            className="mt-4 px-4 py-2 text-blue-600 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                            disabled={loading || products.length >= 50}
                        >
                            + Thêm sản phẩm
                        </button>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm("Bạn có chắc muốn hủy? Mọi dữ liệu sẽ bị mất.")) {
                                    navigate("/admin/manage-flashsales");
                                }
                            }}
                            className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading && (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            {loading ? "Đang xử lý..." : "Tạo Flash Sale"} {/* 🎯 ĐỔI THÀNH "Đang xử lý..." */}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateFlashSale;