import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube, Send, Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
    return (
        <footer className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
            {/* Decorative top wave */}
            <div className="absolute top-0 left-0 right-0 overflow-hidden">
                <svg className="w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                        fill="white" fillOpacity="1"></path>
                </svg>
            </div>

            {/* Newsletter Section */}
            <div className="relative pt-20 pb-8 border-b border-orange-200">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -mr-20 -mt-20"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full -ml-16 -mb-16"></div>

                            <div className="relative z-10 text-center">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                                    <h3 className="text-3xl md:text-4xl font-bold text-white">
                                        Join Our Fashion Community
                                    </h3>
                                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                                </div>
                                <p className="text-white/90 mb-6 text-lg">
                                    Get 15% off your first order + exclusive access to new collections
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                                    <Input
                                        type="email"
                                        placeholder="Your email address"
                                        className="flex-1 bg-white border-0 text-gray-800 placeholder:text-gray-500 h-14 text-lg rounded-2xl shadow-lg"
                                    />
                                    <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 h-14 rounded-2xl shadow-lg font-semibold">
                                        <Send className="w-5 h-5 mr-2" />
                                        Subscribe Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <h2 className="text-4xl font-black bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                                UTE SHOP
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
                                <Sparkles className="w-4 h-4 text-amber-500" />
                            </div>
                        </div>
                        <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                            Where style meets innovation. Discover curated fashion that celebrates your uniqueness and empowers your everyday confidence.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">HOTLINE</div>
                                    <span className="text-gray-800 font-semibold">+84 123 456 789</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">EMAIL</div>
                                    <span className="text-gray-800 font-semibold">support@uteshop.vn</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">ADDRESS</div>
                                    <span className="text-gray-800 font-semibold">01 Võ Văn Ngân, TP. Thủ Đức</span>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div>
                            <p className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                                Connect With Us
                            </p>
                            <div className="flex gap-3">
                                {[
                                    { Icon: Facebook, gradient: "from-blue-500 to-blue-600" },
                                    { Icon: Instagram, gradient: "from-pink-500 via-purple-500 to-orange-500" },
                                    { Icon: Twitter, gradient: "from-sky-400 to-blue-500" },
                                    { Icon: Youtube, gradient: "from-red-500 to-red-600" },
                                    { Icon: Linkedin, gradient: "from-blue-600 to-blue-700" }
                                ].map(({ Icon, gradient }, idx) => (
                                    <button
                                        key={idx}
                                        className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-lg hover:shadow-xl`}
                                    >
                                        <Icon className="w-5 h-5 text-white" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h5 className="text-gray-900 font-bold mb-6 text-lg flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                            Company
                        </h5>
                        <ul className="space-y-3">
                            {["About Us", "Our Story", "Careers", "Press & Media", "Sustainability"].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors duration-300 flex items-center gap-2 group text-base">
                                        <span className="w-0 group-hover:w-2 h-2 rounded-full bg-orange-500 transition-all duration-300"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help Links */}
                    <div>
                        <h5 className="text-gray-900 font-bold mb-6 text-lg flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></div>
                            Help Center
                        </h5>
                        <ul className="space-y-3">
                            {["Customer Support", "Track Order", "Shipping Info", "Returns Policy", "Size Guide"].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-600 hover:text-amber-600 transition-colors duration-300 flex items-center gap-2 group text-base">
                                        <span className="w-0 group-hover:w-2 h-2 rounded-full bg-amber-500 transition-all duration-300"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h5 className="text-gray-900 font-bold mb-6 text-lg flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                            Legal
                        </h5>
                        <ul className="space-y-3">
                            {["Terms of Service", "Privacy Policy", "Cookie Settings", "Accessibility", "Sitemap"].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-600 hover:text-yellow-600 transition-colors duration-300 flex items-center gap-2 group text-base">
                                        <span className="w-0 group-hover:w-2 h-2 rounded-full bg-yellow-500 transition-all duration-300"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-orange-200 bg-white/50">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-gray-600 flex items-center gap-2">
                            © 2025 <span className="text-gray-900 font-bold">UTE SHOP</span>
                            <span className="hidden sm:inline">• All rights reserved</span>
                            <span className="hidden sm:inline">• Made with</span>
                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                            <span className="hidden sm:inline">in Vietnam</span>
                        </div>

                        {/* Payment Methods */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 font-semibold">Secure Payment:</span>
                            <div className="flex gap-2">
                                {[
                                    { name: "VISA", color: "from-blue-600 to-blue-700" },
                                    { name: "MC", color: "from-red-600 to-orange-600" },
                                    { name: "PP", color: "from-blue-500 to-sky-500" },
                                    { name: "AMEX", color: "from-blue-700 to-indigo-700" },
                                    { name: "GPay", color: "from-green-600 to-emerald-600" }
                                ].map((method) => (
                                    <div
                                        key={method.name}
                                        className={`w-14 h-9 bg-gradient-to-br ${method.color} rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-md`}
                                    >
                                        <span className="text-xs font-bold text-white">{method.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}