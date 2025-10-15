// src/admin/pages/Manage/Categories.jsx
import { useEffect, useState } from "react";
import { Table, Button, Space, Tooltip, Modal, Form, Input, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PageMeta from "@/admin/components/common/PageMeta.jsx";
import PageBreadcrumb from "@/admin/components/common/PageBreadCrumb.jsx";
import { getCategories, postCategory, putCategory, deleteCategory } from "@/services/categoryService.jsx";

const Categories = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null); // null = create, object = edit
    const [form] = Form.useForm();

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await getCategories();
            // Controller của bạn có thể trả { success, data } hoặc trả thẳng mảng

            setData(res);
        } catch (e) {
            console.error(e);
            message.error("Không tải được danh mục");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        setOpen(true);
    };

    const openEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({
            name: record.name,
            slug: record.slug,
            description: record.description,
        });
        setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            // xác nhận trước khi gọi API
            const values = await form.validateFields();
            Modal.confirm({
                title: editing ? "Xác nhận cập nhật danh mục?" : "Xác nhận tạo danh mục mới?",
                okText: "Xác nhận",
                cancelText: "Hủy",
                onOk: async () => {
                    try {
                        if (editing) {
                            await putCategory(editing.id, values);
                            message.success("Cập nhật danh mục thành công");
                        } else {
                            await postCategory(values);
                            message.success("Tạo danh mục thành công");
                        }
                        setOpen(false);
                        setEditing(null);
                        form.resetFields();
                        fetchCategories();
                    } catch (err) {
                        console.error(err);
                        message.error("Thao tác thất bại");
                    }
                },
            });
        } catch {
            /* form chưa hợp lệ -> AntD tự hiển thị lỗi */
        }
    };

    const handleDelete = async (record) => {
        try {
            await deleteCategory(record.id);
            message.success("Đã xóa danh mục");
            fetchCategories();
        } catch (e) {
            console.error(e);
            message.error("Xóa danh mục thất bại");
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            align: "center",
        },
        {
            title: "Tên danh mục",
            dataIndex: "name",
            key: "name",
            width: 220,
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            width: 220,
            render: (text) => <span className="text-gray-500">{text}</span>,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Thao tác",
            key: "actions",
            align: "center",
            width: 160,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn chắc chắn muốn xóa danh mục này?"
                            okText="Xóa"
                            cancelText="Hủy"
                            onConfirm={() => handleDelete(record)}
                        >
                            <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <>
            <PageMeta title="Admin UTE Shop | Manage Categories" />
            <PageBreadcrumb pageTitle="Manage Categories" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="mb-4 flex justify-end">
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                        Thêm danh mục
                    </Button>
                </div>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                    bordered
                />
            </div>

            {/* Modal Tạo/Sửa */}
            <Modal
                title={editing ? "Sửa danh mục" : "Thêm danh mục"}
                open={open}
                onCancel={() => { setOpen(false); setEditing(null); }}
                okText={editing ? "Lưu thay đổi" : "Tạo mới"}
                cancelText="Hủy"
                onOk={handleSubmit}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    preserve={false}
                >
                    <Form.Item
                        label="Tên danh mục"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
                    >
                        <Input placeholder="VD: Văn phòng phẩm" />
                    </Form.Item>

                    <Form.Item
                        label="Slug"
                        name="slug"
                        rules={[{ required: true, message: "Vui lòng nhập slug" }]}
                    >
                        <Input placeholder="vd: van-phong-pham" />
                    </Form.Item>

                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea placeholder="Mô tả ngắn..." autoSize={{ minRows: 3 }} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default Categories;
