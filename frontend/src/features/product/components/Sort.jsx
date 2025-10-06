import {Menu, Transition} from "@headlessui/react";
import {Fragment} from "react";

const Sort = ({ sortKey = "", onChangeSort = () => {} }) => {
    const item = (label, key) => (
        <Menu.Item>
            {({ active }) => (
                <button
                    onClick={() => onChangeSort(key)}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                        active ? "text-gray-900 bg-gray-100"
                            : sortKey === key ? "text-gray-900"
                                : "text-gray-500"
                    } focus:outline-hidden`}
                >
                    {label}
                </button>
            )}
        </Menu.Item>
    );

    return (
        <div className="flex items-center z-10">
            <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none">
                    Sort
                    <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="-mr-1 ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500">
                        <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                    </svg>
                </Menu.Button>

                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items
                        className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white
                       shadow-2xl ring-1 ring-black/5 focus:outline-none z-50"
                    >
                        <div className="py-1">
                            {item("Most Popular", "popularity")}
                            {item("Newest", "newest")}
                            {item("Price: Low to High", "price_asc")}
                            {item("Price: High to Low", "price_desc")}
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>

            {/* các nút khác giữ nguyên */}
            <button type="button" className="-m-2 ml-5 p-2 text-gray-400 hover:text-gray-500 sm:ml-7">
                <span className="sr-only">View grid</span>
                <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="size-5">
                    <path d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd" fillRule="evenodd" />
                </svg>
            </button>
            <button type="button" command="show-modal" commandfor="mobile-filters" className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
                <span className="sr-only">Filters</span>
                <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="size-5">
                    <path d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a.75.75 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z" clipRule="evenodd" fillRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};
export default Sort;
