import {useNavigate} from "react-router-dom";
import { Menu } from "@headlessui/react"
import {useSelector} from "react-redux";
const Header = () =>
{
    const navigate = useNavigate();
    const isAuthenticated = useSelector(state => state.user.isAuthenticated);
    const user = useSelector(state => state.user.account);
    return (
        <div>
            <header className="bg-neutral-100">
                <nav aria-label="Global" className="mx-auto flex w-full items-center justify-between p-6 lg:px-8">
                    <div className="flex lg:flex-1">
                        <a href="#" className="-m-1.5 p-1.5">
                            <span className="sr-only">Your Company</span>
                            <img src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                                 alt="" className="h-8 w-auto"/>
                        </a>
                    </div>
                    <div className="flex lg:hidden">
                        <button type="button" command="show-modal" commandfor="mobile-menu"
                                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
                            <span className="sr-only">Open main menu</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                                 data-slot="icon" aria-hidden="true" className="size-6">
                                <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round"
                                      strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    <el-popover-group className="hidden lg:flex lg:gap-x-12">
                        <a href="#" className="text-sm/6 font-semibold text-gray-900">Home</a>
                        <a href="#" className="text-sm/6 font-semibold text-gray-900">Search</a>
                    </el-popover-group>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-x-2">
                        {isAuthenticated === false ?
                            <>
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="bg-white border border-gray-300 px-4 py-2 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Sign Up
                                </button>
                                <button
                                    onClick={() => navigate("/login")}
                                    className="bg-indigo-600 px-4 py-2 rounded-md text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Login
                                </button>
                            </>
                            :
                            <Menu as="div" className="relative inline-block text-left" hidden={false}>
                                <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50">
                                    Options
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="-mr-1 h-5 w-5 text-gray-400">
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Menu.Button>

                                <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <a
                                                    href="#"
                                                    className={`block px-4 py-2 text-sm ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"}`}
                                                >
                                                    {user.email}
                                                </a>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <a
                                                    href="#"
                                                    className={`block px-4 py-2 text-sm ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"}`}
                                                >
                                                    Account settings
                                                </a>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <a
                                                    href="#"
                                                    className={`block px-4 py-2 text-sm ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"}`}
                                                >
                                                    Log out
                                                </a>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                             </Menu>
                        }
                    </div>
                </nav>
            </header>
        </div>
    )
}
export default Header