import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import { Search, ShoppingCart, User, Menu as MenuIcon } from "lucide-react";
import {Menu, Popover, PopoverButton, PopoverPanel} from "@headlessui/react";
import {doLogout} from "@/redux/action/userAction.jsx";
const Header = () =>
{
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(state => state.user.isAuthenticated);
    const user = useSelector(state => state.user.account);
    const handleLogOut = () =>{
        dispatch(doLogout());
        navigate("/");
    }
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white">
            {/* Top banner */}
            <div className="bg-white text-black text-center py-1 text-sm">
                Sign up and get 20% off to your first order. <button className="underline">Sign Up Now</button>
            </div>

            {/* Main header */}
            <div className="container mx-auto px-20 py-8 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <h1 className="text-2xl font-bold">SHOP.CO</h1>
                    <nav className="hidden md:flex items-center gap-6">
                        <button className="flex items-center gap-1">
                            Shop <MenuIcon className="w-4 h-4" />
                        </button>
                        <Popover className="flex">
                            <div className="relative flex">
                                <PopoverButton className="group relative flex items-center justify-center text-sm font-medium transition-colors duration-200 ease-out text-white hover:text-white data-[headlessui-state=open]:text-indigo-600">
                                    SẢN PHẨM
                                    <span
                                        aria-hidden="true"
                                        className="absolute -bottom-2 left-0 h-0.5 w-6 bg-transparent
                                                   transform scale-x-0 origin-left
                                                   transition-transform duration-500 ease-out
                                                   group-hover:scale-x-300 group-hover:bg-white
                                                   data-[headlessui-state=open]:scale-x-100 data-[headlessui-state=open]:bg-indigo-600"
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
                        <button className="text-sm font-medium transition-colors duration-200 ease-out text-white hover:text-stone-400 data-[headlessui-state=open]:text-indigo-600">BỘ SƯU TẬP</button>
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center bg-gray-800 rounded-full px-4 py-2 gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for products..."
                            className="bg-transparent text-white placeholder-gray-400 outline-none"
                        />
                    </div>
                    <ShoppingCart className="w-6 h-6" />
                    {isAuthenticated === false ?
                        <User
                            onClick={() => navigate("/login")}
                            className="w-6 h-6" />
                        :
                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="inline-flex w-full justify-center rounded-full bg-gray-800 p-2 text-sm text-white hover:bg-gray-700 focus:outline-none">
                                <User className="w-6 h-6" />
                            </Menu.Button>

                            <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                <div className="py-1">
                                    <Menu.Item as="div">
                                        {({ active }) => (
                                            <span
                                                className={`block px-4 py-2 text-sm ${
                                                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                                }`}
                                            >{user?.email}
                                            </span>
                                        )}
                                    </Menu.Item>

                                    <Menu.Item as="button"
                                               onClick={()=>(navigate("/profile"))}
                                               className={({ active }) =>
                                                   `block w-full text-left px-4 py-2 text-sm ${
                                                       active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                                   }`
                                               }>
                                        Account settings
                                    </Menu.Item>

                                    <Menu.Item as="button"
                                               onClick={()=>(handleLogOut())}
                                               className={({ active }) =>
                                                   `block w-full text-left px-4 py-2 text-sm ${
                                                       active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                                   }`
                                               }>
                                        Log out
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Menu>
                    }
                </div>
            </div>
        </header>
    )
}

export default Header
