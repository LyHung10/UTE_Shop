import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Space, Tag, Image, Modal, message, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import adminProductService from '@/services/adminProductService';
import { formatPrice } from "@/utils/format.jsx";

const { Search } = Input;
const { Option } = Select;

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({});
    const navigate = useNavigate();

    const columns = useMemo(() => [
        {
            title: 'Sản phẩm',
            key: 'product',
            width: 300,
            fixed: 'left',
            render: (_, record) => (
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                            width={48}
                            height={48}
                            src={record.images?.[0]?.url}
                            fallback="https://via.placeholder.com/50"
                            style={{ objectFit: 'cover' }}
                            preview={false}
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate">
                            {record.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            {record.short_description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {record.slug}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            align: 'center',
            render: (category) => category?.name,
            filters: [
                { text: "Thời trang nam", value: 1 },
                { text: "Thời trang nữ", value: 2 },
            ],
            onFilter: (value, record) => record.category?.id === value,
        },
        {
            title: 'Giá',
            key: 'price',
            width: 120,
            align: 'center',
            sorter: (a, b) => Number(a.price) - Number(b.price),
            render: (_, record) => {
                const hasDiscount = Number(record.discount_percent) > 0 && 
                                  Number(record.original_price) > Number(record.price);
                return (
                    <div className="flex flex-col items-center">
                        <div className="font-medium text-red-600">
                            {formatPrice(Number(record.price || 0))}
                        </div>
                        {hasDiscount && (
                            <div className="text-xs text-gray-500 line-through">
                                {formatPrice(Number(record.original_price || 0))}
                            </div>
                        )}
                        {hasDiscount && (
                            <div className="text-xs text-green-600 font-semibold">
                                -{record.discount_percent}%
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Tồn kho',
            key: 'stock',
            width: 100,
            align: 'center',
            sorter: (a, b) => Number(a.inventory?.stock || 0) - Number(b.inventory?.stock || 0),
            render: (_, record) => {
                const stock = Number(record.inventory?.stock || 0);
                let color = 'green';
                let status = 'Tốt';
                
                if (stock === 0) {
                    color = 'red';
                    status = 'Hết';
                } else if (stock < 10) {
                    color = 'orange';
                    status = 'Sắp hết';
                }
                
                return (
                    <div className="flex flex-col items-center">
                        <span className={`font-semibold ${
                            stock === 0 ? 'text-red-600' : 
                            stock < 10 ? 'text-orange-500' : 'text-green-600'
                        }`}>
                            {stock}
                        </span>
                        <span className={`text-xs ${
                            stock === 0 ? 'text-red-500' : 
                            stock < 10 ? 'text-orange-500' : 'text-green-500'
                        }`}>
                            {status}
                        </span>
                    </div>
                );
            },
        },
        {
            title: 'Lượt xem',
            dataIndex: 'view_count',
            key: 'view_count',
            width: 100,
            align: 'center',
            sorter: (a, b) => Number(a.view_count || 0) - Number(b.view_count || 0),
            render: (count) => (
                <span className="text-blue-600 font-medium">
                    {count || 0}
                </span>
            ),
        },
        // {
        //     title: 'Đã bán',
        //     dataIndex: 'sale_count',
        //     key: 'sale_count',
        //     width: 100,
        //     align: 'center',
        //     sorter: (a, b) => Number(a.sale_count || 0) - Number(b.sale_count || 0),
        //     render: (count) => (
        //         <span className="text-green-600 font-medium">
        //             {count || 0}
        //         </span>
        //     ),
        // },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                        title="Xem chi tiết"
                    >
                        Xem
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        title="Chỉnh sửa"
                    >
                        Sửa
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                        title="Xóa sản phẩm"
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ], []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters
            };

            const response = await adminProductService.getProducts(params);
            if (response.success) {
                setProducts(response.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.pagination.totalItems
                }));
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách sản phẩm');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [pagination.current, pagination.pageSize, filters]);

    const handleTableChange = (newPagination, filters, sorter) => {
        setPagination(newPagination);
        // Có thể xử lý sorter nếu cần
        if (sorter.field) {
            console.log('Sorter:', sorter);
        }
    };

    const handleSearch = (value) => {
        setFilters(prev => ({
            ...prev,
            search: value
        }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleStatusFilter = (value) => {
        setFilters(prev => ({
            ...prev,
            is_active: value
        }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleCategoryFilter = (value) => {
        setFilters(prev => ({
            ...prev,
            category_id: value
        }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleAdd = () => {
        navigate('/admin/manage-products/add');
    };

    const handleEdit = (product) => {
        navigate(`/admin/manage-products/edit/${product.id}`);
    };

    const handleView = (product) => {
        Modal.info({
            title: `Thông tin sản phẩm: ${product.name}`,
            width: 600,
            content: (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <strong>Tên:</strong> {product.name}
                        </div>
                        <div>
                            <strong>Slug:</strong> {product.slug}
                        </div>
                        <div>
                            <strong>Danh mục:</strong> {product.category?.name}
                        </div>
                        <div>
                            <strong>Giá:</strong> {formatPrice(product.price)}
                        </div>
                        <div>
                            <strong>Giá gốc:</strong> {formatPrice(product.original_price)}
                        </div>
                        <div>
                            <strong>Giảm giá:</strong> {product.discount_percent}%
                        </div>
                        <div>
                            <strong>Tồn kho:</strong> {product.inventory?.stock || 0}
                        </div>
                        <div>
                            <strong>Đã bán:</strong> {product.sale_count || 0}
                        </div>
                        <div>
                            <strong>Lượt xem:</strong> {product.view_count || 0}
                        </div>
                        <div>
                            <strong>Trạng thái:</strong> 
                            <Tag color={product.is_active ? 'green' : 'red'} className="ml-2">
                                {product.is_active ? 'Hiển thị' : 'Ẩn'}
                            </Tag>
                        </div>
                    </div>
                    {product.short_description && (
                        <div>
                            <strong>Mô tả ngắn:</strong> 
                            <p className="mt-1 text-gray-600">{product.short_description}</p>
                        </div>
                    )}
                </div>
            ),
        });
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const response = await adminProductService.deleteProduct(id);
                    if (response.success) {
                        message.success('Xóa sản phẩm thành công');
                        fetchProducts();
                    }
                } catch (error) {
                    message.error('Lỗi khi xóa sản phẩm');
                }
            },
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
                    <p className="text-gray-500 mt-1">Quản lý danh sách sản phẩm trong cửa hàng</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="large"
                >
                    Thêm sản phẩm
                </Button>
            </div>

            {/* Filter Section */}
            <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <Search
                    placeholder="Tìm kiếm theo tên sản phẩm..."
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                    enterButton={<SearchOutlined />}
                />
                <Select
                    placeholder="Trạng thái"
                    allowClear
                    style={{ width: 140 }}
                    onChange={handleStatusFilter}
                >
                    <Option value="true">Đang hiển thị</Option>
                    <Option value="false">Đang ẩn</Option>
                </Select>
                <Select
                    placeholder="Danh mục"
                    allowClear
                    style={{ width: 160 }}
                    onChange={handleCategoryFilter}
                >
                    <Option value={1}>Thời trang nam</Option>
                    <Option value={2}>Thời trang nữ</Option>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow">
                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `Hiển thị ${range[0]}-${range[1]} của ${total} sản phẩm`,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
                    size="middle"
                />
            </div>
        </div>
    );
};

export default ProductList;