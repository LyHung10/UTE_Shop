import {Fragment, useEffect, useState} from "react";
import Sort from "@/features/product/components/Sort.jsx";
import Filter from "@/features/product/components/Filter.jsx";
import ListProducts from "@/features/product/components/ListProducts.jsx";
import {useParams} from "react-router-dom";
import {getProductsByCategorySlug} from "@/services/productService.jsx";
import {Pagination} from "antd";
const ProductCategories = () => {
    const { category} = useParams();
    const [pagination,setPagination] = useState({
            totalItems: 0,
            totalPages: 0,
            pageSize: 0,
        }
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [listCategoryProducts, setListCategoryProducts] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const fetchListCategoryProducts = async () => {
        let res = await getProductsByCategorySlug(category,currentPage);
        setListCategoryProducts(res.data.products);
        if (res.data.products.length > 0) {
            setCategoryName(res.data.products[0].category.name);
        }
        setPagination({
            totalItems: res.data.pagination.totalItems,
            totalPages: res.data.pagination.totalPages,
            pageSize: res.data.pagination.pageSize,
        });
    };
    useEffect(() => {
        fetchListCategoryProducts();
    }, [currentPage, category]); // thêm cả category để load lại khi đổi danh mục
    return (
        <>
            <div className="bg-[#f3f4f6]">
                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-baseline justify-between border-b border-gray-200 pt-18 pb-6">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{categoryName}</h1>
                        <Sort/>
                    </div>

                    <section aria-labelledby="products-heading" className="pt-6 pb-24">
                        <h2 id="products-heading" className="sr-only">Products</h2>
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-5">
                            <div className="hidden lg:block bg-white">
                                <div className="max-h-[500px] overflow-y-auto px-3 py-3 space-y-4 border-b border-gray-200 pb-6 text-sm font-medium  text-gray-900">
                                    Bộ lọc tìm kiếm
                                </div>
                                <div className="max-h-[420px] overflow-y-auto px-3 py-4
                                    [&::-webkit-scrollbar]:w-[4px]
                                    [&::-webkit-scrollbar-thumb]:bg-gray-400
                                    [&::-webkit-scrollbar-thumb]:rounded
                                    [&::-webkit-scrollbar-track]:bg-transparent">
                                    <h3 className="sr-only">Categories</h3>
                                    <ul role="list"
                                        className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
                                        <li>
                                            <a href="#">Totes</a>
                                        </li>
                                        <li>
                                            <a href="#">Backpacks</a>
                                        </li>
                                        <li>
                                            <a href="#">Travel Bags</a>
                                        </li>
                                        <li>
                                            <a href="#">Hip Bags</a>
                                        </li>
                                        <li>
                                            <a href="#">Laptop Sleeves</a>
                                        </li>
                                    </ul>
                                    <Filter/>
                                </div>
                            </div>
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
// const [isOpen, setIsOpen] = useState(false)
// <div classNameName="bg-white mt-40">
//     <Dialog open={isOpen} onClose={() => setIsOpen(false)} classNameName="relative z-50 lg:hidden">
//     {/* Nền mờ */}
// <DialogBackdrop classNameName="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear" />
//
// <div classNameName="fixed inset-0 flex">
//     <DialogPanel classNameName="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full">
//         {/* Nút đóng */}
//         <div classNameName="flex px-4 pt-5 pb-2">
//             <button
//                 type="button"
//                 onClick = {()=>setIsOpen(false)}
//                 classNameName="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
//             >
//                 <span classNameName="absolute -inset-0.5"></span>
//                 <span classNameName="sr-only">Close menu</span>
//                 <svg
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                     aria-hidden="true"
//                     classNameName="size-6"
//                 >
//                     <path
//                         d="M6 18 18 6M6 6l12 12"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                     />
//                 </svg>
//             </button>
//         </div>
//
//         {/* Tabs */}
//         <Tab.Group>
//             <div classNameName="border-b border-gray-200">
//                 <Tab.List classNameName="-mb-px flex space-x-8 px-4">
//                     <Tab
//                         classNameName={({ selected }) =>
//                             `flex-1 border-b-2 px-1 py-4 text-base font-medium whitespace-nowrap ${
//                                 selected
//                                     ? 'border-indigo-600 text-indigo-600'
//                                     : 'border-transparent text-gray-900'
//                             }`
//                         }
//                     >
//                         Women
//                     </Tab>
//                     <Tab
//                         classNameName={({ selected }) =>
//                             `flex-1 border-b-2 px-1 py-4 text-base font-medium whitespace-nowrap ${
//                                 selected
//                                     ? 'border-indigo-600 text-indigo-600'
//                                     : 'border-transparent text-gray-900'
//                             }`
//                         }
//                     >
//                         Men
//                     </Tab>
//                 </Tab.List>
//             </div>
//
//             <Tab.Panels>
//                 {/* Panel Women */}
//                 <Tab.Panel classNameName="space-y-10 px-4 pt-10 pb-8">
//                     {/* giữ nguyên nội dung Women */}
//                     {/* ... */}
//                 </Tab.Panel>
//
//                 {/* Panel Men */}
//                 <Tab.Panel classNameName="space-y-10 px-4 pt-10 pb-8">
//                     {/* giữ nguyên nội dung Men */}
//                     {/* ... */}
//                 </Tab.Panel>
//             </Tab.Panels>
//         </Tab.Group>
//
//         {/* Các phần còn lại giữ nguyên */}
//         <div classNameName="space-y-6 border-t border-gray-200 px-4 py-6">
//             <div classNameName="flow-root">
//                 <a
//                     href="#"
//                     classNameName="-m-2 block p-2 font-medium text-gray-900"
//                 >
//                     Company
//                 </a>
//             </div>
//             <div classNameName="flow-root">
//                 <a
//                     href="#"
//                     classNameName="-m-2 block p-2 font-medium text-gray-900"
//                 >
//                     Stores
//                 </a>
//             </div>
//         </div>
//
//         <div classNameName="space-y-6 border-t border-gray-200 px-4 py-6">
//             <div classNameName="flow-root">
//                 <a
//                     href="#"
//                     classNameName="-m-2 block p-2 font-medium text-gray-900"
//                 >
//                     Sign in
//                 </a>
//             </div>
//             <div classNameName="flow-root">
//                 <a
//                     href="#"
//                     classNameName="-m-2 block p-2 font-medium text-gray-900"
//                 >
//                     Create account
//                 </a>
//             </div>
//         </div>
//
//         <div classNameName="border-t border-gray-200 px-4 py-6">
//             <a href="#" classNameName="-m-2 flex items-center p-2">
//                 <img
//                     src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg"
//                     alt=""
//                     classNameName="block h-auto w-5 shrink-0"
//                 />
//                 <span classNameName="ml-3 block text-base font-medium text-gray-900">
//                                             CAD
//                                     </span>
//                 <span classNameName="sr-only">, change currency</span>
//             </a>
//         </div>
//     </DialogPanel>
// </div>
// </Dialog>
//
// <header classNameName="relative bg-white">
//     <p classNameName="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
//         Get free delivery on orders over $100
//     </p>
//
//     <nav
//         aria-label="Top"
//         classNameName="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
//     >
//         <div classNameName="border-b border-gray-200">
//             <div classNameName="flex h-16 items-center">
//                 {/* Nút mở menu mobile */}
//                 <button
//                     type="button"
//                     onClick={() => setIsOpen(true)}
//                     classNameName="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
//                 >
//                     <span classNameName="absolute -inset-0.5"></span>
//                     <span classNameName="sr-only">Open menu</span>
//                     <svg
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="1.5"
//                         aria-hidden="true"
//                         classNameName="size-6"
//                     >
//                         <path
//                             d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                         />
//                     </svg>
//                 </button>
//
//                 {/* Logo */}
//                 <div classNameName="ml-4 flex lg:ml-0">
//                     <a href="#">
//                         <span classNameName="sr-only">Your Company</span>
//                         <img
//                             src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
//                             alt=""
//                             classNameName="h-8 w-auto"
//                         />
//                     </a>
//                 </div>
//
//                 {/* Popover Group (Menu chính) */}
//                 <div classNameName="hidden lg:ml-8 lg:block lg:self-stretch">
//                     <div classNameName="flex h-full space-x-8">
//                         {/* Popover Women */}
//                         <Popover classNameName="flex">
//                             <div classNameName="relative flex">
//                                 <PopoverButton classNameName="relative flex items-center justify-center text-sm font-medium transition-colors duration-200 ease-out text-gray-700 hover:text-gray-800 data-[headlessui-state=open]:text-indigo-600">
//                                     Women
//                                     <span
//                                         aria-hidden="true"
//                                         classNameName="absolute inset-x-0 -bottom-px z-30 h-0.5 bg-transparent duration-200 ease-in data-[headlessui-state=open]:bg-indigo-600"
//                                     ></span>
//                                 </PopoverButton>
//                             </div>
//
//                             <PopoverPanel classNameName="absolute inset-x-0 top-full text-sm text-gray-500 bg-white shadow-sm">
//                                 {/* giữ nguyên grid women */}
//                                 <div classNameName="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//                                     <div classNameName="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
//                                         {/* Cột hình ảnh */}
//                                         <div classNameName="col-start-2 grid grid-cols-2 gap-x-8">
//                                             <div classNameName="group relative text-base sm:text-sm">
//                                                 <img
//                                                     src="https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-01.jpg"
//                                                     alt=""
//                                                     classNameName="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
//                                                 />
//                                                 <a
//                                                     href="#"
//                                                     classNameName="mt-6 block font-medium text-gray-900"
//                                                 >
//                                                                 <span
//                                                                     aria-hidden="true"
//                                                                     classNameName="absolute inset-0 z-10"
//                                                                 ></span>
//                                                     New Arrivals
//                                                 </a>
//                                                 <p aria-hidden="true" classNameName="mt-1">
//                                                     Shop now
//                                                 </p>
//                                             </div>
//                                             <div classNameName="group relative text-base sm:text-sm">
//                                                 <img
//                                                     src="https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-02.jpg"
//                                                     alt=""
//                                                     classNameName="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
//                                                 />
//                                                 <a
//                                                     href="#"
//                                                     classNameName="mt-6 block font-medium text-gray-900"
//                                                 >
//                                                                 <span
//                                                                     aria-hidden="true"
//                                                                     classNameName="absolute inset-0 z-10"
//                                                                 ></span>
//                                                     Basic Tees
//                                                 </a>
//                                                 <p aria-hidden="true" classNameName="mt-1">
//                                                     Shop now
//                                                 </p>
//                                             </div>
//                                         </div>
//
//                                         {/* Cột menu list */}
//                                         <div classNameName="row-start-1 grid grid-cols-3 gap-x-8 gap-y-10 text-sm">
//                                             <div>
//                                                 <p
//                                                     id="Clothing-heading"
//                                                     classNameName="font-medium text-gray-900"
//                                                 >
//                                                     Clothing
//                                                 </p>
//                                                 <ul
//                                                     role="list"
//                                                     aria-labelledby="Clothing-heading"
//                                                     classNameName="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
//                                                 >
//                                                     <li>
//                                                         <a href="#" classNameName="hover:text-gray-800">
//                                                             Tops
//                                                         </a>
//                                                     </li>
//                                                     <li>
//                                                         <a href="#" classNameName="hover:text-gray-800">
//                                                             Dresses
//                                                         </a>
//                                                     </li>
//                                                     <li>
//                                                         <a href="#" classNameName="hover:text-gray-800">
//                                                             Pants
//                                                         </a>
//                                                     </li>
//                                                 </ul>
//                                             </div>
//                                             <div>
//                                                 <p
//                                                     id="Accessories-heading"
//                                                     classNameName="font-medium text-gray-900"
//                                                 >
//                                                     Accessories
//                                                 </p>
//                                                 <ul
//                                                     role="list"
//                                                     aria-labelledby="Accessories-heading"
//                                                     classNameName="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
//                                                 >
//                                                     <li>
//                                                         <a href="#" classNameName="hover:text-gray-800">
//                                                             Watches
//                                                         </a>
//                                                     </li>
//                                                     <li>
//                                                         <a href="#" classNameName="hover:text-gray-800">
//                                                             Bags
//                                                         </a>
//                                                     </li>
//                                                 </ul>
//                                             </div>
//                                             <div>
//                                                 <p
//                                                     id="Brands-heading"
//                                                     classNameName="font-medium text-gray-900"
//                                                 >
//                                                     Brands
//                                                 </p>
//                                                 <ul
//                                                     role="list"
//                                                     aria-labelledby="Brands-heading"
//                                                     classNameName="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
//                                                 >
//                                                     <li>
//                                                         <a href="#" classNameName="hover:text-gray-800">
//                                                             Full Nelson
//                                                         </a>
//                                                     </li>
//                                                     <li>
//                                                         <a href="#" classNameName="hover:text-gray-800">
//                                                             My Way
//                                                         </a>
//                                                     </li>
//                                                 </ul>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </PopoverPanel>
//                         </Popover>
//
//                         {/* Popover Men */}
//
//
//                         {/* Các link khác */}
//                         <a
//                             href="#"
//                             classNameName="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
//                         >
//                             Company
//                         </a>
//                         <a
//                             href="#"
//                             classNameName="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
//                         >
//                             Stores
//                         </a>
//                     </div>
//                 </div>
//
//                 {/* Các phần bên phải (Sign in, Cart...) giữ nguyên */}
//                 <div classNameName="ml-auto flex items-center">
//                     <div classNameName="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
//                         <a
//                             href="#"
//                             classNameName="text-sm font-medium text-gray-700 hover:text-gray-800"
//                         >
//                             Sign in
//                         </a>
//                         <span
//                             aria-hidden="true"
//                             classNameName="h-6 w-px bg-gray-200"
//                         ></span>
//                         <a
//                             href="#"
//                             classNameName="text-sm font-medium text-gray-700 hover:text-gray-800"
//                         >
//                             Create account
//                         </a>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </nav>
// </header>
// </div>