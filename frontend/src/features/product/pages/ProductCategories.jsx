import {Fragment, useEffect, useState} from "react";
import Sort from "@/features/product/components/Sort.jsx";
import Filter from "@/features/product/components/Filter.jsx";
import ListProducts from "@/features/product/components/ListProducts.jsx";
import {useParams} from "react-router-dom";
import {getProductsByCategorySlug} from "@/services/productService.jsx";
import {Pagination} from "antd";
const ProductCategories = () => {
    const { category} = useParams();

    // NEW: parent quản lý filters & sort
    const [selectedColors, setSelectedColors] = useState([]);   // ví dụ: ["Blue","Red"]
    const [selectedSizes, setSelectedSizes] = useState([]);     // ví dụ: ["M","L"]
    const [sortKey, setSortKey] = useState("");                 // "popularity" | "rating" | "newest" | "price_asc" | "price_desc"
    const [currentPage, setCurrentPage] = useState(1);

    const [listCategoryProducts, setListCategoryProducts] = useState([]);
    const [categoryName, setCategoryName] = useState("");

    const [pagination,setPagination] = useState({
            totalItems: 0,
            totalPages: 0,
            pageSize: 0,
        }
    );

    const toggleColor = (color) => {
        setSelectedColors(prev =>
            prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
        );
        setCurrentPage(1); // đổi filter -> về trang 1
    };

    const toggleSize = (size) => {
        setSelectedSizes(prev =>
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
        setCurrentPage(1);
    };

    const handleChangeSort = (key) => {
        setSortKey(key);
        setCurrentPage(1);
    };

    const fetchListCategoryProducts = async () => {
        // NEW: truyền filters & sort vào query
        const res = await getProductsByCategorySlug(category, currentPage, {
            sizes: selectedSizes,
            colors: selectedColors,
            sort: sortKey,
        });

        setListCategoryProducts(res.data.products);
        if (res?.data?.products.length > 0) {
            setCategoryName(res?.data?.products[0].category.name);
        }
        setPagination({
            totalItems: res.data.pagination.totalItems,
            totalPages: res.data.pagination.totalPages,
            pageSize: res.data.pagination.pageSize,
        });
    };

    useEffect(() => {
        fetchListCategoryProducts();
    }, [currentPage, category, selectedColors, selectedSizes, sortKey]);

    return (
        <>
            <div className="bg-[#f3f4f6]">
                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-baseline justify-between border-b border-gray-200 pt-18 pb-6">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{categoryName}</h1>
                        <Sort sortKey={sortKey} onChangeSort={handleChangeSort} />
                    </div>

                    <section aria-labelledby="products-heading" className="pt-6 pb-24">
                        <h2 id="products-heading" className="sr-only">Products</h2>
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-5 items-start">
                            <Filter
                                selectedColors={selectedColors}
                                onToggleColor={toggleColor}
                                selectedSizes={selectedSizes}
                                onToggleSize={toggleSize}
                            />
                            <div className="lg:col-span-4 flex flex-col gap-6">
                                <ListProducts listProducts={listCategoryProducts} />
                                <div className="flex justify-center">
                                    <Pagination
                                        current={currentPage}
                                        total={pagination.totalItems}
                                        pageSize={pagination.pageSize}
                                        showQuickJumper={true}
                                        showTotal={(total) => `Tổng ${total} sản phẩm`}
                                        onChange={(page) => setCurrentPage(page)}
                                        itemRender={(page, type, originalElement) => {
                                            if (type === "page") {
                                                return (
                                                    <div
                                                        style={{
                                                            border: currentPage === page ? "1px solid #000" : "1px solid #d9d9d9",
                                                            color: currentPage === page ? "#000" : "#666",
                                                            borderRadius: 6,
                                                            padding: "0 8px",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        {page}
                                                    </div>
                                                );
                                            }
                                            return originalElement;
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    )
}
export default  ProductCategories
