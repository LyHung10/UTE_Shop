import { FaFacebookF, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { LuPen } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import {useSelector} from "react-redux";

export default function ProfilePage() {
    const user = useSelector(state => state.user);
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img
                        src="https://i.pravatar.cc/100"
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                        <h2 className="text-xl font-bold">Musharof Chowdhury</h2>
                        <p className="text-gray-600">
                            Team Manager <span className="mx-2">|</span> Arizona, United States
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full border text-gray-600 hover:bg-gray-100">
                        <FaFacebookF />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full border text-gray-600 hover:bg-gray-100">
                        <RxCross2 />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full border text-gray-600 hover:bg-gray-100">
                        <FaLinkedinIn />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full border text-gray-600 hover:bg-gray-100">
                        <FaInstagram />
                    </button>
                    <button className="flex items-center gap-1 border rounded-full px-4 py-2 text-gray-700 hover:bg-gray-100">
                        <LuPen size={16} /> Edit
                    </button>
                </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Personal Information</h3>
                    <button className="flex items-center gap-1 border rounded-full px-4 py-2 text-gray-700 hover:bg-gray-100">
                        <LuPen size={16} /> Edit
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                        <p className="text-sm text-gray-500">First Name</p>
                        <p className="font-medium">{user?.first_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Last Name</p>
                        <p className="font-medium">{user?.last_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email address</p>
                        <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">+09 363 398 46</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm text-gray-500">Bio</p>
                        <p className="font-medium">Team Manager</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
