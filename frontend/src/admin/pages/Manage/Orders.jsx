import PageMeta from "@/admin/components/common/PageMeta.jsx";
import PageBreadcrumb from "@/admin/components/common/PageBreadCrumb.jsx";
import Badge from "@/admin/ui/badge/Badge.jsx";
import DataTable from "@/admin/components/tables/OrderDataTable.jsx";
import {formatPrice} from "@/utils/format.jsx";
import {useEffect, useState} from "react";
import {getAllOrders, putConfirmOrder} from "@/services/adminService.jsx";
import toast from "react-hot-toast";

const rows = [
    { id: 1, orderId: "A001", customer: "John", amount: 120, status: "NEW" },
    { id: 2, orderId: "A002", customer: "Jane", amount: 220, status: "PACKING" },
    { id: 3, orderId: "A003", customer: "Alex", amount: 180, status: "SHIPPING" },
    { id: 4, orderId: "A004", customer: "Mia",  amount: 310, status: "COMPLETED" },
    { id: 5, orderId: "A005", customer: "Tom",  amount: 90,  status: "CANCELED" },
];

const columns = [
    {
        title: "Order ID",
        dataIndex: "orderId",
        key: "orderId",
        width: 80,
        fixed: "left",
        align: "center"
    },
    {
        title: "Customer",
        dataIndex: "userName",
        key: "userName",
        width: 140,
        ellipsis: true,
        align: "center"
    },
    {
        title: "Address",
        dataIndex: "address",
        key: "address",
        ellipsis: true,
        align: "left",
    },
    {
        title: "Total",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 120,
        align: "center",
        sorter: (a, b) => Number(a.totalAmount) - Number(b.totalAmount),
        render: (_, r) => (
            <div className="flex flex-col items-center justify-center">
                <div className="font-medium">{formatPrice(Number(r.totalAmount || 0))}</div>
            </div>
        ),
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        align: "center",
        render: (s) => {
            const k = String(s).toLowerCase();
            const color =
                k === "new" ? "warning" :
                    k === "pending" ? "warning" :
                        k === "packing" ? "warning" :
                            k === "shipping" ? "info" :
                                k === "completed" ? "success" :
                                    "error"; // cancelled
            const label = k.charAt(0).toUpperCase() + k.slice(1);
            return <Badge size="sm" color={color}>{label}</Badge>;
        },
        filters: [
            { text: "New", value: "new" },
            { text: "Pending", value: "pending" },
            { text: "Packing", value: "packing" },
            { text: "Shipping", value: "shipping" },
            { text: "Completed", value: "completed" },
            { text: "Cancelled", value: "cancelled" },
        ],
        onFilter: (val, rec) => String(rec.status).toLowerCase() === val,
    },
];

const Orders = () => {
    const [data,setData] = useState([]);
    const fetchData = async () => {
        const res = await getAllOrders();
        if (res)
        {
            setData(res.data);
        }
    }
    const handleConfirm = async (orderId) => {
        const res = await putConfirmOrder(orderId);
        console.log(res);
        if (res)
        {
            toast.success(res.message);
        }
        fetchData();
    };
    useEffect(() => {
        fetchData();
    }, []);
    return (
        <>
            <PageMeta
                title="Admin UTE Shop | Manage Orders"
            />
            <PageBreadcrumb pageTitle="Manage Orders" />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                {/*<h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">*/}
                {/*  Profile*/}
                {/*</h3>*/}
                <div className="space-y-6">
                    <DataTable
                        columns={columns}
                        dataSource={data ? data : rows}
                        onView={(r) => console.log("view", r)}
                        onConfirm={(r) => handleConfirm(r.orderId)}
                        onCancel={(r) => console.log("cancel", r)}
                    />
                </div>
            </div>
        </>
    )
}
export default Orders;
