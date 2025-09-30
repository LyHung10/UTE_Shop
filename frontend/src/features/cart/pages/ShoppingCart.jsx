import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Minus, Plus, TicketPercent, Loader2, MapPin, ChevronDown, PlusCircle } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
import { updateQuantity, removeFromCart, fetchCart } from "@/redux/action/cartAction.jsx";
import { useNavigate } from "react-router-dom";
import axios from '@/utils/axiosCustomize';

const ShoppingCart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const cart = useSelector(state => state.cart);
    const user = useSelector(state => state.user);

    // State mới cho địa chỉ và shipping
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [shippingFee, setShippingFee] = useState(0);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // State cũ
    const [couponCode, setCouponCode] = useState("");
    const [favorites, setFavorites] = useState(new Set());

    // Fetch danh sách địa chỉ khi component mount
    useEffect(() => {
        fetchAddresses();
    }, []);

    // Tính shipping fee khi chọn địa chỉ mới
    useEffect(() => {
        if (selectedAddress) {
            calculateShippingFee(selectedAddress.id);
        }
    }, [selectedAddress]);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = () => {
            setIsDropdownOpen(false);
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchAddresses = async () => {
        setLoadingAddresses(true);
        try {
            const response = await axios.get('api/address');
            console.log('Addresses response:', response);

            let addressesData = [];
            if (Array.isArray(response)) {
                addressesData = response;
            }

            setAddresses(addressesData);

            // Tự động chọn địa chỉ mặc định nếu có
            if (addressesData.length > 0) {
                const defaultAddress = addressesData.find(addr => addr.is_default);
                if (defaultAddress) {
                    setSelectedAddress(defaultAddress);
                } else {
                    setSelectedAddress(addressesData[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const calculateShippingFee = async (addressId) => {
        if (!addressId) return;

        setLoadingShipping(true);
        try {
            const response = await axios.get(`api/shipping/${addressId}`);
            console.log('Shipping response:', response);

            let fee = 0;
            if (typeof response?.shipping_fee === 'number') {
                fee = response.shipping_fee;
            } else if (typeof response?.fee === 'number') {
                fee = response.fee;
            } else {
                fee = 20000;
            }

            setShippingFee(fee);
        } catch (error) {
            console.error('Error calculating shipping fee:', error);
            setShippingFee(20000);
        } finally {
            setLoadingShipping(false);
        }
    };

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        setIsDropdownOpen(false);
    };

    const toggleFavorite = (id) => {
        setFavorites(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleApplyCoupon = () => {
        dispatch(fetchCart(couponCode));
    };

    // Tính toán tổng
    const subtotal = Number(cart.finalTotal || 0);
    const tax = subtotal > 0 ? 40000 : 0;
    const total = Math.max(0, subtotal - cart.discount + shippingFee + tax);

    const formatAddress = (address) => {
        return ` ${[address.ward, address.district, address.city].filter(Boolean).join(', ')}`;
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items Section */}
                <div className="lg:col-span-2">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                    {/* Address Selector - Combobox Style */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Địa chỉ giao hàng
                        </h2>

                        {loadingAddresses ? (
                            <div className="flex justify-center items-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                                <span className="ml-2 text-gray-600">Đang tải địa chỉ...</span>
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="text-center py-2">
                                <p className="text-gray-500 mb-3">Bạn chưa có địa chỉ nào</p>
                                <button
                                    onClick={() => navigate('add/addresses')}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Thêm địa chỉ mới
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Combobox */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsDropdownOpen(!isDropdownOpen);
                                        }}
                                        className="w-full flex items-center justify-between p-3 text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            {selectedAddress ? (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-gray-900 truncate">
                                                            {selectedAddress.address_line}
                                                        </span>
                                                        {selectedAddress.is_default && (
                                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded shrink-0">
                                                                Mặc định
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {formatAddress(selectedAddress)}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">Chọn địa chỉ giao hàng</span>
                                            )}
                                        </div>
                                        <ChevronDown
                                            className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            <div className="py-1">
                                                {addresses.map((address) => (
                                                    <button
                                                        key={address.id}
                                                        type="button"
                                                        onClick={() => handleAddressSelect(address)}
                                                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedAddress?.id === address.id ? 'bg-gray-100' : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-medium text-gray-900">
                                                                        {address.address_line}
                                                                    </span>
                                                                    {address.is_default && (
                                                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded shrink-0">
                                                                            Mặc định
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-600">
                                                                    {formatAddress(address)}
                                                                </p>
                                                                {address.postal_code && (
                                                                    <p className="text-sm text-gray-500 mt-1">
                                                                        Mã bưu điện: {address.postal_code}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}

                                                {/* Add New Address Button in Dropdown */}
                                                <div className="border-t border-gray-200 mt-1 pt-1">
                                                    <button
                                                        onClick={() => navigate('/add/addresses')}
                                                        className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <PlusCircle className="w-4 h-4" />
                                                        Thêm địa chỉ mới
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Add New Address Button (outside dropdown) */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => navigate('/add/addresses')}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Thêm địa chỉ mới
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-4">
                        {cart.items && cart.items.length > 0 ? (
                            cart.items.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center space-x-4">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <img
                                                src={item.Product?.images && item.Product.images.length > 0 ? item.Product.images[0].url : 'https://via.placeholder.com/150'}
                                                alt={item.Product?.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">{item.Product?.name}</h3>
                                            <div className="flex items-center mt-2 space-x-2">
                                                {item.color && (
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-sm text-gray-500">Color:</span>
                                                        <div
                                                            className="w-4 h-4 rounded border border-gray-300"
                                                            style={{ backgroundColor: item.color }}
                                                        ></div>
                                                    </div>
                                                )}
                                                {item.size && (
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-sm text-gray-500">Size:</span>
                                                        <span className="text-sm text-gray-700">{item.size}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-2 flex items-center gap-3">
                                                <span className="text-xl text-red-600">
                                                    đ{Number(item.price).toLocaleString()}
                                                </span>
                                                {item.Product?.original_price && (
                                                    <span className="text-gray-400 line-through text-sm">
                                                        đ{Number(item.Product.original_price).toLocaleString()}
                                                    </span>
                                                )}
                                                {item.Product?.original_price && (
                                                    <span className="bg-red-100 text-red-600 text-xs font-semibold px-1.5 py-0.5 rounded">
                                                        -{Math.round((1 - Number(item.price) / Number(item.Product.original_price)) * 100)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => toggleFavorite(item.id)}
                                                className={`p-2 rounded-full hover:bg-gray-100 ${favorites.has(item.id) ? 'text-red-500' : 'text-gray-400'}`}
                                            >
                                                <Heart className="w-5 h-5" fill={favorites.has(item.id) ? 'currentColor' : 'none'} />
                                            </button>

                                            <button
                                                onClick={() => dispatch(removeFromCart(item.id))}
                                                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        dispatch(updateQuantity(item.id, Math.max(1, item.qty - 1)));
                                                        setCouponCode("");
                                                    }}
                                                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-lg font-semibold min-w-[2rem] text-center">{item.qty}</span>
                                                <button
                                                    onClick={() => {
                                                        dispatch(updateQuantity(item.id, item.qty + 1));
                                                        setCouponCode("");
                                                    }}
                                                    className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-900 flex items-center justify-center text-white"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                                <p className="text-gray-500 text-lg">Giỏ hàng của bạn đang trống</p>
                                <button
                                    onClick={() => navigate("/")}
                                    className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                                >
                                    Tiếp tục mua sắm
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary - Giữ nguyên phần này */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky" style={{ top: '212px' }}>
                        <div className="space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính</span>
                                <span>{subtotal.toLocaleString()} VND</span>
                            </div>

                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển</span>
                                <span className="flex items-center gap-2">
                                    {loadingShipping ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        shippingFee.toLocaleString()
                                    )} VND
                                </span>
                            </div>

                            <div className="flex justify-between text-gray-600">
                                <span>Thuế</span>
                                <span>{tax.toLocaleString()} VND</span>
                            </div>

                            {cart.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá</span>
                                    <span>-{cart.discount.toLocaleString()} VND</span>
                                </div>
                            )}

                            <hr className="border-gray-200" />
                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                <span>Tổng cộng</span>
                                <span>{total.toLocaleString()} VND</span>
                            </div>
                        </div>

                        {selectedAddress && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Giao hàng đến:</h3>
                                <p className="text-sm text-gray-600">
                                    {selectedAddress.address_line}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {formatAddress(selectedAddress)}
                                </p>
                            </div>
                        )}

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mã giảm giá</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <TicketPercent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        type="text"
                                        placeholder="Nhập mã giảm giá"
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-gray-800 focus:border-gray-800"
                                    />
                                </div>
                                <button
                                    onClick={handleApplyCoupon}
                                    className="shrink-0 px-4 py-2 rounded-lg font-semibold text-white bg-gray-800 hover:bg-gray-900 disabled:opacity-70 flex items-center gap-2"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <button
                                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => navigate("/checkout")}
                                disabled={!selectedAddress || !cart.items || cart.items.length === 0}
                            >
                                Mua hàng
                            </button>
                            <button
                                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg transition duration-200"
                                onClick={() => navigate("/")}
                            >
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingCart;