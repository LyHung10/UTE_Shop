import PageMeta from "@/admin/components/common/PageMeta.jsx";
import PageBreadcrumb from "@/admin/components/common/PageBreadCrumb.jsx";
import Badge from "@/admin/ui/badge/Badge.jsx";
import { Table } from 'antd';
import { formatPrice } from "@/utils/format.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    deleteFlashSale,
    getAllFlashSales
} from "@/services/adminService.jsx";
import toast from "react-hot-toast";

const FlashSale = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    const handleCreate = () => {
        navigate("/admin/manage-flashsales/create");
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getAllFlashSales();
            if (res && res.success) {
                const transformedData = res.data.map(flashSale => {
                    // 🎯 THÊM SẮP XẾP THEO sort_order
                    const products = (flashSale.flash_sale_products || [])
                        .slice() // Tạo bản copy để không ảnh hưởng original array
                        .sort((a, b) => {
                            // Ưu tiên sort_order trước
                            if (a.sort_order !== b.sort_order) {
                                return a.sort_order - b.sort_order;
                            }
                            // Nếu sort_order bằng nhau, sắp xếp theo thời gian tạo
                            return new Date(a.createdAt) - new Date(b.createdAt);
                        })
                        .map(fsp => ({
                            id: fsp.id,
                            product_id: fsp.product_id,
                            flash_price: fsp.flash_price,
                            original_price: fsp.original_price,
                            stock_flash_sale: fsp.stock_flash_sale,
                            sold_flash_sale: fsp.sold_flash_sale,
                            limit_per_user: fsp.limit_per_user,
                            sort_order: fsp.sort_order,
                            product_name: fsp.product?.name || 'N/A',
                            product_slug: fsp.product?.slug || '',
                            product_description: fsp.product?.description || '',
                            product_image: fsp.product?.images?.[0]?.url || null,
                            product_image_alt: fsp.product?.images?.[0]?.alt || fsp.product?.name || 'Product'
                        }));

                    return {
                        ...flashSale,
                        products,
                        products_count: products.length
                    };
                });
                setData(transformedData);
            }
        } catch (error) {
            toast.error("Lỗi khi tải danh sách flash sale");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (record) => {
        if (!confirm(`Bạn có chắc muốn xóa flash sale "${record.name}"?`)) return;

        try {
            const res = await deleteFlashSale(record.id);
            if (res && res.success) {
                toast.success(res.message);
                fetchData();
            }
        } catch (error) {
            toast.error(error.message || "Lỗi khi xóa flash sale");
        }
    };

    const handleExpand = (expanded, record) => {
        const keys = expanded
            ? [...expandedRowKeys, record.id]
            : expandedRowKeys.filter(key => key !== record.id);
        setExpandedRowKeys(keys);
    };

    const expandedRowRender = (record) => {
        if (!record.products || record.products.length === 0) {
            return (
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-500 text-lg font-medium mb-4">
                            Chưa có sản phẩm nào trong flash sale này
                        </p>
                        {/* ✅ ĐÃ SỬA - DÙNG navigate */}
                        <button
                            onClick={() => navigate(`/admin/manage-flashsales/${record.id}/products`)}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                            📦 Quản lý sản phẩm
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <span className="text-2xl">🛍️</span>
                        Danh sách sản phẩm ({record.products.length})
                    </h4>
                    {/* ✅ ĐÃ SỬA - DÙNG navigate */}
                    <button
                        onClick={() => navigate(`/admin/manage-flashsales/${record.id}/products`)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium flex items-center gap-2"
                    >
                        📦 Quản lý sản phẩm
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {record.products.map((product, index) => (
                        <div
                            key={product.id || index}
                            className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex gap-3 mb-3">
                                {product.product_image ? (
                                    <img
                                        src={product.product_image}
                                        alt={product.product_image_alt}
                                        className="w-16 h-16 object-cover rounded-lg border"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                                        📦
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                                        {product.product_name}
                                    </h5>
                                    <Badge size="sm" color="info">
                                        ID: {product.product_id}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm border-t pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Giá gốc:</span>
                                    <span className="font-medium line-through text-red-500">
                                        {formatPrice(product.original_price)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Giá flash sale:</span>
                                    <span className="font-bold text-green-600 text-base">
                                        {formatPrice(product.flash_price)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center bg-blue-50 -mx-4 px-4 py-2">
                                    <span className="text-blue-700 font-medium">💰 Tiết kiệm:</span>
                                    <span className="font-bold text-blue-700">
                                        {formatPrice(parseFloat(product.original_price) - parseFloat(product.flash_price))}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-600">📦 Kho:</span>
                                    <span className="font-medium">
                                        {product.stock_flash_sale}
                                        {product.sold_flash_sale > 0 && (
                                            <span className="text-xs text-gray-500 ml-1">
                                                (Đã bán: {product.sold_flash_sale})
                                            </span>
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">👤 Giới hạn/user:</span>
                                    <Badge size="sm" color="warning">
                                        {product.limit_per_user || 1}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">🔢 Thứ tự:</span>
                                    <Badge size="sm" color="default">
                                        #{product.sort_order}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 60,
            fixed: "left",
            align: "center",
            render: (id) => <span className="font-mono text-gray-600">#{id}</span>
        },
        {
            title: "Tên Flash Sale",
            dataIndex: "name",
            key: "name",
            width: 250,
            ellipsis: true,
            render: (name, record) => (
                <div className="flex flex-col">
                    <div
                        className="font-medium text-gray-900 dark:text-white flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleExpand(!expandedRowKeys.includes(record.id), record)}
                    >
                        <span className="text-xl">📢</span>
                        <span className="hover:underline">{name}</span>
                        {record.products && record.products.length > 0 && (
                            <Badge size="sm" color="info">
                                {record.products.length} SP
                            </Badge>
                        )}
                    </div>
                    {record.description && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {record.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Thời gian",
            dataIndex: "start_time",
            key: "time",
            width: 200,
            align: "center",
            render: (_, record) => (
                <div className="flex flex-col items-center text-xs space-y-1">
                    <div className="text-gray-600 bg-green-50 px-2 py-1 rounded">
                        <span className="font-medium">🟢 Bắt đầu:</span>{' '}
                        {new Date(record.start_time).toLocaleString('vi-VN')}
                    </div>
                    <div className="text-gray-600 bg-red-50 px-2 py-1 rounded">
                        <span className="font-medium">🔴 Kết thúc:</span>{' '}
                        {new Date(record.end_time).toLocaleString('vi-VN')}
                    </div>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            align: "center",
            render: (status, record) => {
                const actualStatus = record.calculatedStatus || status;
                const statusMap = {
                    'upcoming': { color: 'warning', label: '⏰ Sắp diễn ra' },
                    'active': { color: 'success', label: '🔥 Đang diễn ra' },
                    'ended': { color: 'error', label: '✅ Đã kết thúc' }
                };
                const statusInfo = statusMap[actualStatus] || { color: 'default', label: actualStatus };

                return <Badge size="sm" color={statusInfo.color}>{statusInfo.label}</Badge>;
            },
            filters: [
                { text: "⏰ Sắp diễn ra", value: "upcoming" },
                { text: "🔥 Đang diễn ra", value: "active" },
                { text: "✅ Đã kết thúc", value: "ended" },
            ],
            onFilter: (val, rec) => (rec.calculatedStatus || rec.status) === val,
        },
        {
            title: "Số sản phẩm",
            dataIndex: "products_count",
            key: "products_count",
            width: 120,
            align: "center",
            render: (count, record) => {
                const actualCount = record.products?.length || 0;
                const isExpanded = expandedRowKeys.includes(record.id);

                return (
                    <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-blue-600 text-lg">{actualCount}</span>
                        {actualCount > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleExpand(!isExpanded, record);
                                }}
                                className="text-xs text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded font-medium transition-colors"
                            >
                                {isExpanded ? '▼ Ẩn SP' : '▶ Xem SP'}
                            </button>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Hành động",
            key: "actions",
            width: 200, // 🎯 TĂNG ĐỘ RỘNG
            fixed: "right",
            align: "center",
            render: (_, record) => {
                const isActive = record.calculatedStatus === 'active' || record.status === 'active';

                return (
                    <div className="flex gap-2 justify-center">
                        {/* 🎯 NÚT QUẢN LÝ SP - LÀM NỔI BẬT HƠN */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/manage-flashsales/${record.id}/products`);
                            }}
                            className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-1"
                            title="Quản lý sản phẩm trong flash sale"
                        >
                            <span className="text-base">📦</span>
                            Quản lý SP
                        </button>

                        {/* 🎯 NÚT XÓA - LÀM RÕ RÀNG HƠN */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(record);
                            }}
                            className={`px-3 py-2 text-sm rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-1 ${isActive
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                                }`}
                            disabled={isActive}
                            title={isActive ? "Không thể xóa flash sale đang diễn ra" : "Xóa flash sale"}
                        >
                            <span className="text-base">🗑️</span>
                            {!isActive && 'Xóa'}
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <PageMeta title="Admin UTE Shop | Quản lý Flash Sale" />
            <PageBreadcrumb pageTitle="Quản lý Flash Sale" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
                            <span className="text-3xl">⚡</span>
                            Quản lý Flash Sale
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Tổng số: <strong>{data.length}</strong> chương trình |
                            Đang mở: <strong>{expandedRowKeys.length}</strong>
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium"
                    >
                        ⚡ Tạo Flash Sale Mới
                    </button>
                </div>

                {/* <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                        <span className="text-xl">💡</span>
                        <span>
                            <strong>Hướng dẫn:</strong> Click vào <strong>tên Flash Sale</strong>,
                            <strong> icon ▶</strong> hoặc <strong>button "Xem SP"</strong> để xem/ẩn danh sách sản phẩm
                        </span>
                    </p>
                </div> */}

                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} flash sales`,
                        pageSizeOptions: ['10', '20', '50', '100']
                    }}
                    scroll={{ x: 1200 }}
                    expandable={{
                        expandedRowRender,
                        expandedRowKeys,
                        onExpand: handleExpand,
                        rowExpandable: (record) => record.products && record.products.length > 0,
                        expandIcon: ({ expanded, onExpand, record }) =>
                            record.products && record.products.length > 0 ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onExpand(record, e);
                                    }}
                                    className="p-2 hover:bg-blue-100 rounded-lg transition-all text-blue-600 font-bold text-lg"
                                    title={expanded ? "Ẩn sản phẩm" : "Xem sản phẩm"}
                                >
                                    {expanded ? '▼' : '▶'}
                                </button>
                            ) : (
                                <div className="w-8"></div>
                            ),
                    }}
                />
            </div>
        </>
    );
};

export default FlashSale;