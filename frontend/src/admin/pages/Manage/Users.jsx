import PageMeta from "@/admin/components/common/PageMeta.jsx";
import PageBreadcrumb from "@/admin/components/common/PageBreadCrumb.jsx";
import DataTable from "@/admin/components/tables/UserDataTable.jsx";
import {useEffect, useState} from "react";
import {getAlUsers} from "@/services/adminService.jsx";
import Badge from "@/admin/ui/badge/Badge.jsx";

const rows = [
    {
        id: 1,
        first_name: "Lindsey",
        last_name: "Curtis",
        email: "lindsey@example.com",
        phone_number: "0987 123 456",
        image: "/images/user/user-17.jpg",
        is_verified: true,
        role_id: "admin",
        position_id: "manager",
    },
    {
        id: 2,
        first_name: "Kaiya",
        last_name: "George",
        email: "kaiya@example.com",
        phone_number: "0912 888 999",
        image: "/images/user/user-18.jpg",
        is_verified: false,
        role_id: "staff",
        position_id: "editor",
    },
];

const columns = [
    {
        title: "Customer",
        key: "name",
        align: "left",
        width: 150,
        render: (_, r) => (
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 overflow-hidden rounded-full bg-gray-100">
                    <img src={r.image} alt={`${r.first_name} ${r.last_name}`} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white/90 truncate">
                        {r.first_name} {r.last_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {r.email}
                    </div>
                </div>
            </div>
        ),
    },
    {
        title: "Phone",
        dataIndex: "phone_number",
        key: "phone_number",
        width: 100,
        align: "center",
    },
    {
        title: "Points",
        dataIndex: "loyalty_points",
        key: "loyalty_points",
        width: 100,
        align: "center",
    },
    {
        title: "Active",
        key: "is_active",
        width: 120,
        align: "center",
        filters: [
            { text: "Active", value: true },
            { text: "Banned", value: false },
        ],
        onFilter: (val, r) => Boolean(r.is_verified) === val,
        render: (v, r) => (
            <Badge size="sm" color={r.is_verified ? "success" : "error"}>
                {r.is_active ? "Active" : "Banned"}
            </Badge>
        ),
    },
];

const Users = () => {
    const [data,setData] = useState([]);
    const fetchData = async () => {
        const res = await getAlUsers();
        if (res && res.success)
        {
            setData(res.data.users);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);
    return (
        <>
            <PageMeta
                title="Admin UTE Shop | Manage Customers"
            />
            <PageBreadcrumb pageTitle="Manage Customer" />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                {/*<h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">*/}
                {/*  Profile*/}
                {/*</h3>*/}
                <div className="space-y-6">
                    <DataTable
                        columns={columns}
                        dataSource={data ? data : rows}
                        actions={["disable"]}                 // 👈 chỉ hiện 1 action: Vô hiệu hoá
                        pagination={{ pageSize: 10 }}
                        onDisable={(user) => {
                            // TODO: gọi API vô hiệu hoá user theo user.id
                            console.log("disable user", user);
                        }}
                    />
                </div>
            </div>
        </>
    )
}
export default Users;

