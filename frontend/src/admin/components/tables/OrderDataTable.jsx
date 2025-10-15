import React from "react";
import { Table, Tag, Space, Button, Tooltip, Popconfirm } from "antd";
import {
    EyeOutlined,
    CheckCircleOutlined,
    RetweetOutlined,
    InfoCircleOutlined, CloseOutlined, CloseCircleOutlined,
} from "@ant-design/icons";
import {XCircle} from "lucide-react";

const VND = new Intl.NumberFormat("vi-VN");

const STATUS_COLOR = {
    NEW: "gold",
    PACKING: "blue",
    SHIPPING: "lime",
    COMPLETED: "green",
    CANCELLED: "red",
};

const OrderDataTable = ({
                            data = [],
                            loading = false,
                            onViewInfo = () => {},
                            onConfirmPacking = () => {},
                            onConfirmShippingOrder = () => {},
                            onConfirmCompletedOrder = () => {},
                            onCancel = () => {},
                        }) => {


    const columns = [
        {
            title: "Order ID",
            dataIndex: "orderId",
            key: "orderId",
            width: 80,
            align: "center",
            render: (v) => <span className="font-medium">#{v}</span>,
        },
        {
            title: "Customer",
            dataIndex: "userName",
            key: "userName",
            width: 150,
            align: "center",
            ellipsis: true,
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
            ellipsis: true,
            render: (v) => v || <span className="text-gray-400">—</span>,
        },
        {
            title: "Total",
            dataIndex: "totalAmount",
            key: "totalAmount",
            width: 140,
            align: "center",
            render: (v) => `${VND.format(Number(v || 0))}₫`,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 130,

            // ✅ thêm filter cho Status
            filters: [
                { text: "NEW", value: "NEW" },
                { text: "PACKING", value: "PACKING" },
                { text: "SHIPPING", value: "SHIPPING" },
                { text: "COMPLETED", value: "COMPLETED" },
                { text: "CANCELLED", value: "CANCELLED" },
            ],

            // ✅ logic lọc: chỉ hiển thị hàng có status trùng giá trị filter
            onFilter: (value, record) => record.status === value,

            render: (s) => {
                const color = STATUS_COLOR[s] || "default";
                return <Tag color={color}>{s}</Tag>;
            },
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 210,
            render: (_, record) => {
                const st = record.status; // "NEW" | "PACKING" | "SHIPPING" | "COMPLETED" | ...

                const canConfirmPacking = st === "NEW";                 // NEW -> PACKING
                const canToShipping     = st === "PACKING";             // PACKING -> SHIPPING
                const canComplete       = st === "SHIPPING";             // PACKING -> COMPLETED (theo yêu cầu)
                const canCancel         = st === "NEW" || st === "PACKING"; // chỉ NEW & PACKING được hủy

                return (
                    <Space>
                        {/* Info: luôn có */}
                        <Tooltip title="Chi tiết đơn hàng">
                            <Button icon={<InfoCircleOutlined />} onClick={() => onViewInfo(record)} />
                        </Tooltip>

                        {/* NEW -> PACKING */}
                        {canConfirmPacking && (
                            <Popconfirm
                                title="Xác nhận chuyển sang PACKING?"
                                okText="Xác nhận"
                                cancelText="Hủy"
                                onConfirm={() => onConfirmPacking(record)}
                            >
                                <Tooltip title="Xác nhận packing">
                                    <Button icon={<CheckCircleOutlined />}>
                                        Packing
                                    </Button>
                                </Tooltip>
                            </Popconfirm>
                        )}

                        {/* PACKING -> SHIPPING */}
                        {canToShipping && (
                            <Popconfirm
                                title="Xác nhận chuyển sang SHIPPING?"
                                okText="Chuyển"
                                cancelText="Hủy"
                                onConfirm={() => onConfirmShippingOrder(record)}
                            >
                                <Tooltip title="Chuyển shipping">
                                    <Button icon={<RetweetOutlined />}>Shipping</Button>
                                </Tooltip>
                            </Popconfirm>
                        )}

                        {/* PACKING -> COMPLETED (chỉ khi PACKING) */}
                        {canComplete && (
                            <Popconfirm
                                title="Đánh dấu đơn hàng hoàn thành?"
                                okText="Hoàn thành"
                                cancelText="Hủy"
                                onConfirm={() => onConfirmCompletedOrder(record)}
                            >
                                <Tooltip title="Hoàn thành đơn">
                                    <Button icon={<CheckCircleOutlined />}>Complete</Button>
                                </Tooltip>
                            </Popconfirm>
                        )}

                        {/* HỦY: chỉ NEW & PACKING */}
                        {canCancel && (
                            <Popconfirm
                                title="Xác nhận hủy đơn hàng?"
                                okText="Hủy đơn"
                                cancelText="Đóng"
                                onConfirm={() => onCancel(record)}
                            >
                                <Tooltip title="Hủy đơn hàng">
                                    <Button danger icon={<CloseCircleOutlined />}></Button>
                                </Tooltip>
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <Table
            rowKey={(r) => r.orderId}
            columns={columns}
            dataSource={data}
            loading={loading}
            scroll={{ x: 900 }}
            pagination={{
                pageSize: 15,
                showSizeChanger: false,
            }}
        />
    );
};

export default OrderDataTable;
