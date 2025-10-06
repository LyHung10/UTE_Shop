import PageMeta from "@/admin/components/common/PageMeta.jsx";
import PageBreadcrumb from "@/admin/components/common/PageBreadCrumb.jsx";
import {formatPrice} from "@/utils/format.jsx";
import {useMemo} from "react";
import DataTable from "@/admin/components/tables/UserDataTable.jsx";
import Badge from "@/admin/ui/badge/Badge.jsx";

const products = [
    {
        id: 1,
        name: "Áo thun UTE",
        slug: "ao-thun-ute",
        short_description: "Chất cotton thoáng mát",
        price: 159000,
        original_price: 199000,
        discount_percent: 20,
        view_count: 245,
        sale_count: 120,
        is_active: true,
        featured: true,
        category: { id: 10, name: "Áo thun" },
        images: [{ url: "/images/product/p1.jpg" }],
        inventory: { quantity: 42 },
    },
    {
        id: 2,
        name: "Quần jogger",
        slug: "quan-jogger",
        short_description: "Chống nhăn, co giãn",
        price: 299000,
        original_price: 299000,
        discount_percent: 0,
        view_count: 80,
        sale_count: 12,
        is_active: false,
        featured: false,
        category: { id: 11, name: "Quần" },
        images: [{ url: "/images/product/p2.jpg" }],
        inventory: { quantity: 0 },
    },
];

const Products = () => {
    const columns = useMemo(
        () => [
            {
                title: "Product",
                key: "name",
                align: "center",
                width: 250,
                fixed: "left",
                render: (_, r) => (
                    <div className="flex ms-5 items-start gap-3">
                        <div className="w-12 h-12 overflow-hidden rounded-lg bg-gray-100">
                            <img
                                src={r.images?.[0]?.url || "/images/product/placeholder.png"}
                                alt={r.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="min-w-0 text-left">
                            <div className="font-medium text-gray-900 dark:text-white/90 truncate">
                                {r.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {r.short_description}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: "Category",
                key: "category",
                dataIndex: ["category", "name"],
                width: 100,
                align: "center",
                filters: [
                    // Nếu có list category thật, map động vào đây
                    { text: "Áo thun", value: "Áo thun" },
                    { text: "Quần", value: "Quần" },
                ],
                onFilter: (val, r) => (r.category?.name || "").toLowerCase() === String(val).toLowerCase(),
            },
            {
                title: "Price",
                key: "price",
                width: 100,
                align: "center",
                sorter: (a, b) => Number(a.price) - Number(b.price),
                render: (_, r) => {
                    const hasDiscount = Number(r.discount_percent) > 0 && Number(r.original_price) > Number(r.price);
                    return (
                        <div className="flex flex-col items-center justify-center">
                            <div className="font-medium">{formatPrice(Number(r.price || 0))}</div>
                            {hasDiscount && (
                                <div className="text-xs text-gray-500 line-through">
                                    {formatPrice(Number(r.original_price || 0))}
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                title: "Stock",
                key: "stock",
                width: 90,
                align: "center",
                sorter: (a, b) => Number(a?.inventory?.quantity || 0) - Number(b?.inventory?.quantity || 0),
                render: (_, r) => {
                    const qty = Number(r?.inventory?.quantity || 0);
                    const color = qty > 20 ? "success" : qty > 0 ? "warning" : "error";
                    return (
                        <Badge size="sm" color={color}>
                            {qty}
                        </Badge>
                    );
                },
            },
            {
                title: "Views",
                dataIndex: "view_count",
                key: "view_count",
                width: 90,
                align: "center",
                sorter: (a, b) => Number(a.view_count || 0) - Number(b.view_count || 0),
            },
            {
                title: "Sales",
                dataIndex: "sale_count",
                key: "sale_count",
                width: 90,
                align: "center",
                sorter: (a, b) => Number(a.sale_count || 0) - Number(b.sale_count || 0),
            },
        ],
        []
    );
    return (
        <>
            <PageMeta
                title="Admin UTE Shop | Manage Products"
            />
            <PageBreadcrumb pageTitle="Manage Products" />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                {/*<h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">*/}
                {/*  Profile*/}
                {/*</h3>*/}
                <div className="space-y-6">
                    <DataTable
                        columns={columns}
                        dataSource={products}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 980 }}
                        // Action: chỉ View / Edit / Disable (vô hiệu hoá/ẩn sản phẩm)
                        actions={["view", "edit", "disable"]}
                        onView={(p) => console.log("view product", p)}
                        onEdit={(p) => console.log("edit product", p)}
                        onDisable={(p) => {
                            // TODO: gọi API toggle is_active theo p.id, ví dụ:
                            // apiProducts.toggleActive(p.id, !p.is_active)
                            console.log("disable / toggle active product", p);
                        }}
                    />
                </div>
            </div>
        </>
    )
}
export default Products;

