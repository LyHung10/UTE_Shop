// src/admin/pages/Manage/Vouchers.jsx
import { useEffect, useState } from "react";
import {
    Table,
    Button,
    Space,
    Tooltip,
    Modal,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Select,
    Popconfirm,
    message, Row, Col,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import PageMeta from "@/admin/components/common/PageMeta.jsx";
import PageBreadcrumb from "@/admin/components/common/PageBreadCrumb.jsx";
import {deleteVoucher, getListVouchers, postCreateVoucher, putUpdateVoucher} from "@/services/voucherService.jsx";


const { RangePicker } = DatePicker;

const Vouchers = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null); // null = create, object = edit
    const [form] = Form.useForm();

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const res = await getListVouchers();
            // Controller của bạn có thể trả { success, data } hoặc trả thẳng mảng
            const list = res?.data?.data || res?.data || res || [];
            setData(list);
        } catch (e) {
            console.error(e);
            message.error("Không tải được voucher");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

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
            discount_type: record.discount_type,
            discount_value: record.discount_value,
            max_discount: record.max_discount,
            min_order_value: record.min_order_value,
            usage_limit: record.usage_limit,
            status: record.status,
            date_range:
                record.start_date && record.end_date
                    ? [dayjs(record.start_date), dayjs(record.end_date)]
                    : undefined,
        });
        setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            // xác nhận trước khi gọi API
            const values = await form.validateFields();
            Modal.confirm({
                title: editing ? "Xác nhận cập nhật voucher?" : "Xác nhận tạo voucher mới?",
                okText: "Xác nhận",
                cancelText: "Hủy",
                onOk: async () => {
                    try {
                        const [start, end] = values.date_range || [];
                        const payload = {
                            name: values.name?.trim(),
                            slug: values.slug?.trim(),
                            description: values.description?.trim() || null,
                            discount_type: values.discount_type,
                            discount_value: Number(values.discount_value),
                            max_discount:
                                values.discount_type === "percent" && values.max_discount !== undefined
                                    ? Number(values.max_discount)
                                    : null,
                            min_order_value:
                                values.min_order_value !== undefined ? Number(values.min_order_value) : 0,
                            usage_limit:
                                values.usage_limit !== undefined ? Number(values.usage_limit) : 0,
                            start_date: start ? start.toDate() : null,
                            end_date: end ? end.toDate() : null,
                            status: values.status,
                        };

                        if (editing) {
                            await putUpdateVoucher(editing.id, payload);
                            message.success("Cập nhật voucher thành công");
                        } else {
                            await postCreateVoucher(payload);
                            message.success("Tạo voucher thành công");
                        }
                        setOpen(false);
                        setEditing(null);
                        form.resetFields();
                        fetchVouchers();
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
            await deleteVoucher(record.id);
            message.success("Đã xóa voucher");
            fetchVouchers();
        } catch (e) {
            console.error(e);
            message.error("Xóa voucher thất bại");
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
            title: "Tên voucher",
            dataIndex: "name",
            key: "name",
            width: 220,
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            width: 200,
            render: (text) => <span className="text-gray-500">{text}</span>,
        },
        {
            title: "Loại",
            dataIndex: "discount_type",
            key: "discount_type",
            width: 110,
        },
        {
            title: "Giá trị",
            key: "discount_value",
            width: 170,
            render: (_, r) =>
                r.discount_type === "percent"
                    ? `${r.discount_value}%` + (r.max_discount != null ? ` (max ${r.max_discount})` : "")
                    : `${Number(r.discount_value).toLocaleString()} đ`,
        },
        {
            title: "ĐH tối thiểu",
            dataIndex: "min_order_value",
            key: "min_order_value",
            width: 140,
            render: (v) => (v ? `${Number(v).toLocaleString()} đ` : "0 đ"),
        },
        {
            title: "Số lượt còn",
            dataIndex: "usage_limit",
            key: "usage_limit",
            width: 120,
            align: "center",
        },
        {
            title: "Hiệu lực",
            key: "date_range",
            width: 240,
            render: (_, r) => {
                const s = r.start_date ? dayjs(r.start_date).format("DD/MM/YYYY") : "-";
                const e = r.end_date ? dayjs(r.end_date).format("DD/MM/YYYY") : "-";
                return `${s} → ${e}`;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 110,
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
                            title="Bạn chắc chắn muốn xóa voucher này?"
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
            <PageMeta title="Admin UTE Shop | Manage Vouchers" />
            <PageBreadcrumb pageTitle="Manage Vouchers" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="mb-4 flex justify-end">
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                        Thêm voucher
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


            <Modal
                title={editing ? "Sửa voucher" : "Thêm voucher"}
                open={open}
                onCancel={() => {
                    setOpen(false);
                    setEditing(null);
                }}
                okText={editing ? "Lưu thay đổi" : "Tạo mới"}
                cancelText="Hủy"
                onOk={handleSubmit}
                destroyOnClose
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <Row gutter={[16, 8]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Tên voucher"
                                name="name"
                                rules={[{ required: true, message: "Vui lòng nhập tên voucher" }]}
                            >
                                <Input placeholder="VD: Giảm 10% toàn shop" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Slug"
                                name="slug"
                                rules={[
                                    { required: true, message: "Vui lòng nhập slug" },
                                    { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Chỉ chữ thường, số và '-'" },
                                ]}
                            >
                                <Input placeholder="vd: giam-10" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item label="Mô tả" name="description">
                                <Input.TextArea placeholder="Mô tả ngắn..." autoSize={{ minRows: 3 }} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Loại giảm giá"
                                name="discount_type"
                                rules={[{ required: true, message: "Vui lòng chọn loại giảm giá" }]}
                            >
                                <Select
                                    options={[
                                        { value: "percent", label: "Percent (%)" },
                                        { value: "fixed", label: "Fixed (đ)" },
                                    ]}
                                    placeholder="Chọn loại"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Giá trị giảm"
                                name="discount_value"
                                rules={[{ required: true, message: "Vui lòng nhập giá trị giảm" }]}
                            >
                                <InputNumber style={{ width: "100%" }} placeholder="VD: 10 hoặc 50000" min={0} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Giảm tối đa (chỉ dùng với percent)" name="max_discount">
                                <InputNumber style={{ width: "100%" }} placeholder="VD: 100000" min={0} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Đơn hàng tối thiểu" name="min_order_value">
                                <InputNumber style={{ width: "100%" }} placeholder="VD: 200000" min={0} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Số lượt còn" name="usage_limit">
                                <InputNumber style={{ width: "100%" }} placeholder="VD: 100" min={0} precision={0} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Trạng thái"
                                name="status"
                                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                                initialValue="active"
                            >
                                <Select
                                    options={[
                                        { value: "active", label: "Active" },
                                        { value: "inactive", label: "Inactive" },
                                    ]}
                                    placeholder="Chọn trạng thái"
                                />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                label="Thời gian hiệu lực"
                                name="date_range"
                                rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
                            >
                                <RangePicker style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};

export default Vouchers;
