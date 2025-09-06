import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import { Search, ShoppingCart, User, Menu as MenuIcon } from "lucide-react";
import { Menu } from "@headlessui/react";
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
                        <button>On Sale</button>
                        <button>New Arrivals</button>
                        <button>Brands</button>
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
                                               }
                                    >
                                        Account settings
                                    </Menu.Item>

                                    <Menu.Item as="button"
                                               onClick={()=>(handleLogOut())}
                                               className={({ active }) =>
                                                   `block w-full text-left px-4 py-2 text-sm ${
                                                       active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                                   }`
                                               }
                                    >
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
