import {Dialog,Popover,Tab, DialogBackdrop, DialogPanel, PopoverButton, PopoverPanel} from "@headlessui/react";
import {useState} from "react";


const ProductCategories = () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <div className="bg-white mt-40">
                <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50 lg:hidden">
                    {/* Nền mờ */}
                    <DialogBackdrop className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear" />

                    <div className="fixed inset-0 flex">
                        <DialogPanel className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full">
                            {/* Nút đóng */}
                            <div className="flex px-4 pt-5 pb-2">
                                <button
                                    type="button"
                                    onClick = {()=>setIsOpen(false)}
                                    className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                                >
                                    <span className="absolute -inset-0.5"></span>
                                    <span className="sr-only">Close menu</span>
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        aria-hidden="true"
                                        className="size-6"
                                    >
                                        <path
                                            d="M6 18 18 6M6 6l12 12"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Tabs */}
                            <Tab.Group>
                                <div className="border-b border-gray-200">
                                    <Tab.List className="-mb-px flex space-x-8 px-4">
                                        <Tab
                                            className={({ selected }) =>
                                                `flex-1 border-b-2 px-1 py-4 text-base font-medium whitespace-nowrap ${
                                                    selected
                                                        ? 'border-indigo-600 text-indigo-600'
                                                        : 'border-transparent text-gray-900'
                                                }`
                                            }
                                        >
                                            Women
                                        </Tab>
                                        <Tab
                                            className={({ selected }) =>
                                                `flex-1 border-b-2 px-1 py-4 text-base font-medium whitespace-nowrap ${
                                                    selected
                                                        ? 'border-indigo-600 text-indigo-600'
                                                        : 'border-transparent text-gray-900'
                                                }`
                                            }
                                        >
                                            Men
                                        </Tab>
                                    </Tab.List>
                                </div>

                                <Tab.Panels>
                                    {/* Panel Women */}
                                    <Tab.Panel className="space-y-10 px-4 pt-10 pb-8">
                                        {/* giữ nguyên nội dung Women */}
                                        {/* ... */}
                                    </Tab.Panel>

                                    {/* Panel Men */}
                                    <Tab.Panel className="space-y-10 px-4 pt-10 pb-8">
                                        {/* giữ nguyên nội dung Men */}
                                        {/* ... */}
                                    </Tab.Panel>
                                </Tab.Panels>
                            </Tab.Group>

                            {/* Các phần còn lại giữ nguyên */}
                            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                                <div className="flow-root">
                                    <a
                                        href="#"
                                        className="-m-2 block p-2 font-medium text-gray-900"
                                    >
                                        Company
                                    </a>
                                </div>
                                <div className="flow-root">
                                    <a
                                        href="#"
                                        className="-m-2 block p-2 font-medium text-gray-900"
                                    >
                                        Stores
                                    </a>
                                </div>
                            </div>

                            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                                <div className="flow-root">
                                    <a
                                        href="#"
                                        className="-m-2 block p-2 font-medium text-gray-900"
                                    >
                                        Sign in
                                    </a>
                                </div>
                                <div className="flow-root">
                                    <a
                                        href="#"
                                        className="-m-2 block p-2 font-medium text-gray-900"
                                    >
                                        Create account
                                    </a>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 px-4 py-6">
                                <a href="#" className="-m-2 flex items-center p-2">
                                    <img
                                        src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg"
                                        alt=""
                                        className="block h-auto w-5 shrink-0"
                                    />
                                    <span className="ml-3 block text-base font-medium text-gray-900">
                                            CAD
                                    </span>
                                    <span className="sr-only">, change currency</span>
                                </a>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                <header className="relative bg-white">
                    <p className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
                        Get free delivery on orders over $100
                    </p>

                    <nav
                        aria-label="Top"
                        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
                    >
                        <div className="border-b border-gray-200">
                            <div className="flex h-16 items-center">
                                {/* Nút mở menu mobile */}
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(true)}
                                    className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                                >
                                    <span className="absolute -inset-0.5"></span>
                                    <span className="sr-only">Open menu</span>
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        aria-hidden="true"
                                        className="size-6"
                                    >
                                        <path
                                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>

                                {/* Logo */}
                                <div className="ml-4 flex lg:ml-0">
                                    <a href="#">
                                        <span className="sr-only">Your Company</span>
                                        <img
                                            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                                            alt=""
                                            className="h-8 w-auto"
                                        />
                                    </a>
                                </div>

                                {/* Popover Group (Menu chính) */}
                                <div className="hidden lg:ml-8 lg:block lg:self-stretch">
                                    <div className="flex h-full space-x-8">
                                        {/* Popover Women */}
                                        <Popover className="flex">
                                            <div className="relative flex">
                                                <PopoverButton className="relative flex items-center justify-center text-sm font-medium transition-colors duration-200 ease-out text-gray-700 hover:text-gray-800 data-[headlessui-state=open]:text-indigo-600">
                                                    Women
                                                    <span
                                                        aria-hidden="true"
                                                        className="absolute inset-x-0 -bottom-px z-30 h-0.5 bg-transparent duration-200 ease-in data-[headlessui-state=open]:bg-indigo-600"
                                                    ></span>
                                                </PopoverButton>
                                            </div>

                                            <PopoverPanel className="absolute inset-x-0 top-full text-sm text-gray-500 bg-white shadow-sm">
                                                {/* giữ nguyên grid women */}
                                                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                                    <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
                                                        {/* Cột hình ảnh */}
                                                        <div className="col-start-2 grid grid-cols-2 gap-x-8">
                                                            <div className="group relative text-base sm:text-sm">
                                                                <img
                                                                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-01.jpg"
                                                                    alt=""
                                                                    className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                                                                />
                                                                <a
                                                                    href="#"
                                                                    className="mt-6 block font-medium text-gray-900"
                                                                >
                                                                <span
                                                                  aria-hidden="true"
                                                                  className="absolute inset-0 z-10"
                                                                ></span>
                                                                    New Arrivals
                                                                </a>
                                                                <p aria-hidden="true" className="mt-1">
                                                                    Shop now
                                                                </p>
                                                            </div>
                                                            <div className="group relative text-base sm:text-sm">
                                                                <img
                                                                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-02.jpg"
                                                                    alt=""
                                                                    className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                                                                />
                                                                <a
                                                                    href="#"
                                                                    className="mt-6 block font-medium text-gray-900"
                                                                >
                                                                <span
                                                                  aria-hidden="true"
                                                                  className="absolute inset-0 z-10"
                                                                ></span>
                                                                    Basic Tees
                                                                </a>
                                                                <p aria-hidden="true" className="mt-1">
                                                                    Shop now
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Cột menu list */}
                                                        <div className="row-start-1 grid grid-cols-3 gap-x-8 gap-y-10 text-sm">
                                                            <div>
                                                                <p
                                                                    id="Clothing-heading"
                                                                    className="font-medium text-gray-900"
                                                                >
                                                                    Clothing
                                                                </p>
                                                                <ul
                                                                    role="list"
                                                                    aria-labelledby="Clothing-heading"
                                                                    className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                                                >
                                                                    <li>
                                                                        <a href="#" className="hover:text-gray-800">
                                                                            Tops
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a href="#" className="hover:text-gray-800">
                                                                            Dresses
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a href="#" className="hover:text-gray-800">
                                                                            Pants
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <p
                                                                    id="Accessories-heading"
                                                                    className="font-medium text-gray-900"
                                                                >
                                                                    Accessories
                                                                </p>
                                                                <ul
                                                                    role="list"
                                                                    aria-labelledby="Accessories-heading"
                                                                    className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                                                >
                                                                    <li>
                                                                        <a href="#" className="hover:text-gray-800">
                                                                            Watches
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a href="#" className="hover:text-gray-800">
                                                                            Bags
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <p
                                                                    id="Brands-heading"
                                                                    className="font-medium text-gray-900"
                                                                >
                                                                    Brands
                                                                </p>
                                                                <ul
                                                                    role="list"
                                                                    aria-labelledby="Brands-heading"
                                                                    className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                                                >
                                                                    <li>
                                                                        <a href="#" className="hover:text-gray-800">
                                                                            Full Nelson
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a href="#" className="hover:text-gray-800">
                                                                            My Way
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </PopoverPanel>
                                        </Popover>

                                        {/* Popover Men */}


                                        {/* Các link khác */}
                                        <a
                                            href="#"
                                            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                                        >
                                            Company
                                        </a>
                                        <a
                                            href="#"
                                            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                                        >
                                            Stores
                                        </a>
                                    </div>
                                </div>

                                {/* Các phần bên phải (Sign in, Cart...) giữ nguyên */}
                                <div className="ml-auto flex items-center">
                                    <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                                        <a
                                            href="#"
                                            className="text-sm font-medium text-gray-700 hover:text-gray-800"
                                        >
                                            Sign in
                                        </a>
                                        <span
                                            aria-hidden="true"
                                            className="h-6 w-px bg-gray-200"
                                        ></span>
                                        <a
                                            href="#"
                                            className="text-sm font-medium text-gray-700 hover:text-gray-800"
                                        >
                                            Create account
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>
                </header>
            </div>
        </>
    )
}
export default  ProductCategories