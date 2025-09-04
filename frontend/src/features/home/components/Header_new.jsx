import {Menu, Search, ShoppingCart, User} from "lucide-react";

const Header_new = () =>
{
    return (
        <header className="bg-black text-white">
            {/* Top banner */}
            <div className="bg-black text-center py-2 text-sm">
                Sign up and get 20% off to your first order. <button className="underline">Sign Up Now</button>
            </div>

            {/* Main header */}
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <h1 className="text-2xl font-bold">SHOP.CO</h1>
                    <nav className="hidden md:flex items-center gap-6">
                        <button className="flex items-center gap-1">
                            Shop <Menu className="w-4 h-4" />
                        </button>
                        <button>On Sale</button>
                        <button>New Arrivals</button>
                        <button>Brands</button>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center bg-gray-800 rounded-full px-4 py-2 gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for products..."
                            className="bg-transparent text-white placeholder-gray-400 outline-none"
                        />
                    </div>
                    <ShoppingCart className="w-6 h-6" />
                    <User className="w-6 h-6" />
                </div>
            </div>
        </header>
    )
}

export default Header_new
