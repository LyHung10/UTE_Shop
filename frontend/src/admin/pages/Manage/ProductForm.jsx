import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    InputNumber,
    Select,
    Switch,
    Upload,
    Button,
    Space,
    Row,
    Col,
    message,
    Tag,
    Card,
    Divider
} from 'antd';
import { PageHeader } from '@ant-design/pro-components';
import { UploadOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import adminProductService from '@/services/adminProductService';
import { toast } from 'react-toastify';
import {getCategories} from "@/services/categoryService.jsx";

const { TextArea } = Input;
const { Option } = Select;

const colorOptions = [
    'Red', 'Blue', 'Black', 'Gray', 'Brown', 'White',
    'Silver', 'Gold', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink'
];

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];


const ProductForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [existingFileList, setExistingFileList] = useState([]);
    const [newFileList, setNewFileList] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const validateForm = (values) => {
        const errors = [];

        if (!values.name?.trim()) {
            errors.push('Vui lòng nhập tên sản phẩm');
        } else if (values.name.length < 2 || values.name.length > 255) {
            errors.push('Tên sản phẩm phải từ 2 đến 255 ký tự');
        }

        if (!values.slug?.trim()) {
            errors.push('Vui lòng nhập slug');
        } else if (!/^[a-z0-9-]+$/.test(values.slug)) {
            errors.push('Slug chỉ được chứa chữ thường, số và dấu gạch ngang');
        }

        if (!values.category_id) {
            errors.push('Vui lòng chọn danh mục');
        }

        if (!values.original_price || values.original_price <= 0) {
            errors.push('Giá gốc phải lớn hơn 0');
        }
        if (!values.price || values.price <= 0) {
            errors.push('Giá bán phải lớn hơn 0');
        }
        if (values.price > values.original_price) {
            errors.push('Giá bán không được lớn hơn giá gốc');
        }

        if (values.discount_percent < 0 || values.discount_percent > 100) {
            errors.push('Phần trăm giảm giá phải từ 0 đến 100');
        }

        if (values.stock < 0) {
            errors.push('Số lượng tồn kho không được âm');
        } else if (values.stock > 1000000) {
            errors.push('Số lượng tồn kho quá lớn (tối đa 1,000,000)');
        }

        if (values.reserved < 0) {
            errors.push('Số lượng đặt trước không được âm');
        } else if (values.reserved > values.stock) {
            errors.push('Số lượng đặt trước không được lớn hơn tồn kho');
        }

        if (values.short_description?.length > 500) {
            errors.push('Mô tả ngắn không được vượt quá 500 ký tự');
        }
        if (values.description?.length > 5000) {
            errors.push('Mô tả chi tiết không được vượt quá 5000 ký tự');
        }

        if (!isEdit && newFileList.length === 0) {
            errors.push('Vui lòng thêm ít nhất 1 ảnh cho sản phẩm');
        }

        const totalImages = newFileList.length + (isEdit ? existingFileList.length : 0);
        if (totalImages > 10) {
            errors.push('Tối đa 10 ảnh cho mỗi sản phẩm');
        }

        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
            return false;
        }

        return true;
    };
    console.log(categoryOptions);
    const validateImages = () => {
        for (const file of newFileList) {
            if (file.originFileObj) {
                if (file.originFileObj.size > 5 * 1024 * 1024) {
                    toast.error(`Ảnh "${file.name}" vượt quá 5MB`);
                    return false;
                }

                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
                if (!allowedTypes.includes(file.originFileObj.type)) {
                    toast.error(`Ảnh "${file.name}" không đúng định dạng (chỉ chấp nhận JPEG, PNG, WebP)`);
                    return false;
                }
            }
        }
        return true;
    };

    const fillTestData = () => {
        const testData = {
            name: `Áo thun UTE ${Math.floor(Math.random() * 1000)}`,
            slug: `ao-thun-ute-${Math.floor(Math.random() * 1000)}`,
            category_id: 1,
            original_price: 250000,
            price: 199000,
            discount_percent: 20,
            stock: 50,
            reserved: 5,
            short_description: 'Áo thun chất cotton thoáng mát, co giãn tốt',
            description: 'Áo thun UTE chất liệu cotton 100%, thoáng mát, thấm hút mồ hôi tốt. Phù hợp cho mọi hoạt động hàng ngày.',
            colors: ['Red', 'Blue', 'Black'],
            sizes: ['M', 'L', 'XL'],
            is_active: true,
            featured: true,
            tryon: true,
        };

        form.setFieldsValue(testData);
        message.info('Đã điền dữ liệu test!');
    };

    const fetchCategoryOptions = async () => {
        const res = await getCategories();
        setCategoryOptions(res);
    }

    useEffect(() => {
        fetchCategoryOptions();
        if (isEdit) {
            fetchProductDetail();
        } else {
            form.resetFields();
            setExistingFileList([]);
            setNewFileList([]);
        }
    }, [id]);

    const fetchProductDetail = async () => {
        setFetching(true);
        try {
            const response = await adminProductService.getProductById(id);
            if (response && (response.data || response.id)) {
                const product = response.data || response;

                const formValues = {
                    name: product.name,
                    slug: product.slug,
                    category_id: product.category_id,
                    original_price: Number(product.original_price),
                    price: Number(product.price),
                    discount_percent: Number(product.discount_percent),
                    short_description: product.short_description,
                    description: product.description,
                    colors: product.colors?.map(c => c.name) || [],
                    sizes: product.sizes || [],
                    is_active: product.is_active,
                    featured: product.featured,
                    tryon: product.tryon,
                    stock: product.inventory?.stock ? Number(product.inventory.stock) : 0,
                    reserved: product.inventory?.reserved ? Number(product.inventory.reserved) : 0,
                };

                form.setFieldsValue(formValues);

                if (product.images && product.images.length > 0) {
                    const existingImages = product.images.map(img => ({
                        uid: `existing-${img.id}`,
                        name: img.alt || img.url,
                        status: 'done',
                        url: img.url,
                        isExisting: true
                    }));
                    setExistingFileList(existingImages);
                }
            } else {
                toast.error('Không có dữ liệu sản phẩm');
            }
        } catch (error) {
            console.error('❌ Error fetching product:', error);
            toast.error('Lỗi khi tải thông tin sản phẩm: ' + (error.message || 'Unknown error'));
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (values) => {
        if (!validateForm(values) || !validateImages()) {
            return;
        }

        setLoading(true);
        try {
            let response;

            if (isEdit) {
                const productData = {
                    name: values.name.trim(),
                    slug: values.slug.trim(),
                    category_id: values.category_id,
                    original_price: values.original_price,
                    price: values.price,
                    discount_percent: values.discount_percent,
                    short_description: values.short_description?.trim() || '',
                    description: values.description?.trim() || '',
                    colors: JSON.stringify(values.colors),
                    sizes: JSON.stringify(values.sizes),
                    is_active: values.is_active,
                    featured: values.featured,
                    tryon: values.tryon,
                    stock: values.stock || 0,
                    reserved: values.reserved || 0,
                };

                response = await adminProductService.updateProduct(id, productData);

                if (newFileList.length > 0) {
                    const imageFormData = new FormData();
                    newFileList.forEach(file => {
                        imageFormData.append('images', file.originFileObj);
                    });

                    await adminProductService.updateProductImages(id, imageFormData);
                    
                    if (existingFileList.length > 0) {
                        toast.success(`Đã thay thế ${existingFileList.length} ảnh cũ bằng ${newFileList.length} ảnh mới`);
                    } else {
                        toast.success(`Đã thêm ${newFileList.length} ảnh mới cho sản phẩm`);
                    }
                }

            } else {
                const formData = new FormData();

                const productData = {
                    name: values.name.trim(),
                    slug: values.slug.trim(),
                    category_id: values.category_id,
                    original_price: values.original_price,
                    price: values.price,
                    discount_percent: values.discount_percent,
                    short_description: values.short_description?.trim() || '',
                    description: values.description?.trim() || '',
                    colors: JSON.stringify(values.colors),
                    sizes: JSON.stringify(values.sizes),
                    is_active: values.is_active,
                    featured: values.featured,
                    tryon: values.tryon,
                    stock: values.stock || 0,
                    reserved: values.reserved || 0,
                };

                Object.keys(productData).forEach(key => {
                    formData.append(key, productData[key]);
                });

                newFileList.forEach(file => {
                    if (file.originFileObj) {
                        formData.append('images', file.originFileObj);
                    }
                });

                response = await adminProductService.createProduct(formData);
            }

            if (response && response.success) {
                toast.success(isEdit ? '✅ Cập nhật sản phẩm thành công!' : '✅ Thêm sản phẩm mới thành công!');
                navigate('/admin/manage-products');
            } else {
                toast.error(response?.message || 'Có lỗi xảy ra khi xử lý sản phẩm');
            }
        } catch (error) {
            console.error('❌ Submit error:', error);
            
            const errorMessage = error.message || 
                               error.response?.data?.message || 
                               error.response?.data?.error || 
                               (isEdit ? 'Cập nhật sản phẩm thất bại' : 'Thêm sản phẩm thất bại');
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        onRemove: (file) => {
            setNewFileList(prev => prev.filter(f => f.uid !== file.uid));
        },
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Chỉ được upload file ảnh!');
                return false;
            }

            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Ảnh phải nhỏ hơn 5MB!');
                return false;
            }

            setNewFileList(prev => [...prev, {
                uid: `new-${Date.now()}-${Math.random()}`,
                name: file.name,
                status: 'done',
                originFileObj: file,
                isNew: true
            }]);

            return false;
        },
        fileList: newFileList,
        multiple: true,
        listType: "picture-card",
        maxCount: 10,
        accept: "image/jpeg,image/png,image/webp,image/jpg"
    };

    const ExistingImagesSection = () => {
        if (existingFileList.length === 0) return null;

        return (
            <div style={{ marginBottom: 24 }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 12,
                    padding: '8px 12px',
                    backgroundColor: '#fff2f0',
                    border: '1px solid #ffccc7',
                    borderRadius: 6
                }}>
                    <span style={{ fontWeight: 'bold', color: '#a8071a' }}>
                        ⚠️ Ảnh hiện tại ({existingFileList.length} ảnh)
                    </span>
                    <span style={{ marginLeft: 8, color: '#a8071a', fontSize: '12px' }}>
                        {newFileList.length > 0 ? 'Sẽ bị thay thế bởi ảnh mới' : 'Sẽ được giữ nguyên'}
                    </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {existingFileList.map(file => (
                        <div
                            key={file.uid}
                            style={{
                                position: 'relative',
                                opacity: newFileList.length > 0 ? 0.5 : 1,
                                transition: 'opacity 0.3s'
                            }}
                        >
                            <img
                                src={file.url}
                                alt={file.name}
                                style={{
                                    width: 80,
                                    height: 80,
                                    objectFit: 'cover',
                                    borderRadius: 6,
                                    border: newFileList.length > 0 ? '2px solid #ff4d4f' : '2px solid #d9d9d9'
                                }}
                            />
                            {newFileList.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 6
                                }}>
                                    <span style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                                        SẼ BỊ THAY THẾ
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const NewImagesSection = () => {
        return (
            <div style={{ marginBottom: 16 }}>
                {newFileList.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 12,
                        padding: '8px 12px',
                        backgroundColor: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: 6
                    }}>
                        <span style={{ fontWeight: 'bold', color: '#389e0d' }}>
                            📸 Ảnh mới ({newFileList.length} ảnh)
                        </span>
                    </div>
                )}

                <Upload {...uploadProps}>
                    {newFileList.length >= 10 ? null : (
                        <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>
                                {isEdit ? 'Thêm ảnh mới thay thế' : 'Tải ảnh lên'}
                            </div>
                        </div>
                    )}
                </Upload>
            </div>
        );
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    return (
        <div className="p-6">
            <PageHeader
                title={isEdit ? `Cập nhật sản phẩm #${id}` : 'Thêm sản phẩm mới'}
                onBack={() => navigate('/admin/manage-products')}
                breadcrumb={{
                    items: [
                        { title: <Link to="/admin/manage-products">Quản lý sản phẩm</Link> },
                        { title: isEdit ? 'Cập nhật' : 'Thêm mới' },
                    ],
                }}
            />



            {/* Debug Info */}
            <div style={{
                background: '#f0f0f0',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace'
            }}>
                <div>🔍 Debug Info:</div>
                <div>- ID: {id || 'null'}</div>
                <div>- Edit Mode: {isEdit ? 'YES' : 'NO'}</div>
                <div>- Fetching: {fetching ? 'YES' : 'NO'}</div>
                <div>- Existing Images: {existingFileList.length}</div>
                <div>- New Images: {newFileList.length}</div>
            </div>

            <Card className="mt-6" loading={fetching}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        is_active: true,
                        featured: false,
                        tryon: false,
                        discount_percent: 0,
                        stock: 0,
                        reserved: 0,
                        colors: [],
                        sizes: []
                    }}
                >
                    {/* Thông tin cơ bản */}
                    <Divider orientation="left">Thông tin cơ bản</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Tên sản phẩm"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                            >
                                <Input placeholder="Nhập tên sản phẩm" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Slug"
                                name="slug"
                                rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
                            >
                                <Input placeholder="Nhập slug" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Danh mục"
                                name="category_id"
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                            >
                                <Select placeholder="Chọn danh mục" size="large">
                                    {categoryOptions?.map(category => (
                                        <Option key={category.id} value={category.id}>
                                            {category.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Giá cả */}
                    <Divider orientation="left">Thông tin giá</Divider>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Giá gốc"
                                name="original_price"
                                rules={[{ required: true, message: 'Vui lòng nhập giá gốc' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/₫\s?|(,*)/g, '')}
                                    placeholder="Nhập giá gốc"
                                    size="large"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Giá bán"
                                name="price"
                                rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/₫\s?|(,*)/g, '')}
                                    placeholder="Nhập giá bán"
                                    size="large"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Giảm giá (%)"
                                name="discount_percent"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={100}
                                    placeholder="Phần trăm giảm giá"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Tồn kho */}
                    <Divider orientation="left">Quản lý tồn kho</Divider>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Tồn kho" name="stock">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="Số lượng tồn kho"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Đã đặt trước" name="reserved">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="Số lượng đặt trước"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Mô tả */}
                    <Divider orientation="left">Mô tả sản phẩm</Divider>

                    <Form.Item
                        label="Mô tả ngắn"
                        name="short_description"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Nhập mô tả ngắn về sản phẩm..."
                            showCount
                            maxLength={200}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả chi tiết"
                        name="description"
                    >
                        <TextArea
                            rows={6}
                            placeholder="Nhập mô tả chi tiết về sản phẩm..."
                            showCount
                            maxLength={2000}
                        />
                    </Form.Item>

                    {/* Thuộc tính sản phẩm */}
                    <Divider orientation="left">Thuộc tính sản phẩm</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Màu sắc" name="colors">
                                <Select
                                    mode="multiple"
                                    placeholder="Chọn màu sắc"
                                    size="large"
                                >
                                    {colorOptions.map(color => (
                                        <Option key={color} value={color}>
                                            <Tag color={color.toLowerCase()}>{color}</Tag>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Kích thước" name="sizes">
                                <Select
                                    mode="multiple"
                                    placeholder="Chọn kích thước"
                                    size="large"
                                >
                                    {sizeOptions.map(size => (
                                        <Option key={size} value={size}>{size}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Hình ảnh */}
                    <Divider orientation="left">
                        Hình ảnh sản phẩm
                        {isEdit && newFileList.length > 0 && (
                            <Tag color="red" style={{ marginLeft: 8 }}>
                                🔄 Ảnh mới sẽ THAY THẾ ảnh cũ
                            </Tag>
                        )}
                    </Divider>

                    <ExistingImagesSection />

                    <Form.Item
                        label={isEdit ? "Ảnh mới thay thế" : "Hình ảnh sản phẩm"}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        extra={
                            <div>
                                <div>Tối đa 10 ảnh, mỗi ảnh dưới 5MB</div>
                                {isEdit && (
                                    <div style={{ color: '#ff4d4f', fontWeight: 'bold', marginTop: 4 }}>
                                        ⚠️ Lưu ý: Ảnh mới sẽ THAY THẾ HOÀN TOÀN ảnh cũ
                                    </div>
                                )}
                            </div>
                        }
                    >
                        <NewImagesSection />
                    </Form.Item>

                    {/* Cài đặt */}
                    <Divider orientation="left">Cài đặt hiển thị</Divider>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Hiển thị sản phẩm"
                                name="is_active"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                            <div className="text-gray-500 text-sm mt-1">
                                Sản phẩm sẽ hiển thị trên website
                            </div>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Sản phẩm nổi bật"
                                name="featured"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                            <div className="text-gray-500 text-sm mt-1">
                                Hiển thị ở section nổi bật
                            </div>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Cho phép thử đồ"
                                name="tryon"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                            <div className="text-gray-500 text-sm mt-1">
                                Cho phép khách hàng thử đồ ảo
                            </div>
                        </Col>
                    </Row>

                    {/* Actions */}
                    <Divider />

                    <Form.Item>
                        <Space size="middle">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                size="large"
                            >
                                {isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                            </Button>

                            {!isEdit && (
                                <Button
                                    onClick={fillTestData}
                                    size="large"
                                    type="dashed"
                                >
                                    Fill Test Data
                                </Button>
                            )}

                            <Button
                                onClick={() => navigate('/admin/manage-products')}
                                size="large"
                            >
                                Hủy bỏ
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ProductForm;