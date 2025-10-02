import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Minus, Plus, TicketPercent, Loader2, MapPin, ChevronDown, PlusCircle, ShoppingBag, Package } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
import { updateQuantity, removeFromCart, fetchCart } from "@/redux/action/cartAction.jsx";
import { useNavigate } from "react-router-dom";
import axios from '@/utils/axiosCustomize';
import FavoriteButton from "../../../components/ui/FavoriteButton"

const ShoppingCart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const cart = useSelector(state => state.cart);
    const user = useSelector(state => state.user);

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [shippingFee, setShippingFee] = useState(0);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [favorites, setFavorites] = useState(new Set());

    useEffect(() => {
        fetchAddresses();
    }, []);

    useEffect(() => {
        if (selectedAddress) {
            calculateShippingFee(selectedAddress.id);
        }
    }, [selectedAddress]);

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
            let addressesData = [];
            if (Array.isArray(response)) {
                addressesData = response;
            }

            setAddresses(addressesData);

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

    const subtotal = Number(cart.finalTotal || 0);
    const tax = subtotal > 0 ? 40000 : 0;
    const total = Math.max(0, subtotal - cart.discount + shippingFee + tax);

    const formatAddress = (address) => {
        return `${[address.address_line, address.ward, address.district, address.city].filter(Boolean).join(', ')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Giỏ hàng của bạn
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {cart.items?.length || 0} sản phẩm
                                </p>
                            </div>
                        </div>

                        {/* Address Selector - ĐÃ SỬA HOÀN TOÀN Z-INDEX */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 transition-all hover:shadow-2xl relative z-40">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Địa chỉ giao hàng
                                </h2>
                            </div>

                            {loadingAddresses ? (
                                <div className="flex justify-center items-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                    <span className="ml-3 text-gray-600">Đang tải địa chỉ...</span>
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <MapPin className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 mb-4">Bạn chưa có địa chỉ nào</p>
                                    <button
                                        onClick={() => navigate('/add/addresses')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        Thêm địa chỉ mới
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsDropdownOpen(!isDropdownOpen);
                                            }}
                                            className="w-full flex items-center justify-between p-4 text-left border-2 border-gray-200 rounded-2xl bg-white hover:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex-1 min-w-0">
                                                {selectedAddress ? (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="font-semibold text-gray-900 truncate">
                                                                {selectedAddress.name_order + " - " + selectedAddress.phone_order}
                                                            </span>
                                                            {selectedAddress.is_default && (
                                                                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-2.5 py-1 rounded-full shrink-0 font-medium">
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
                                                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>

                                        {/* ĐÃ SỬA: Tăng z-index rất cao và đảm bảo positioning */}
                                        {isDropdownOpen && (
                                            <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
                                                <div className="p-2">
                                                    {addresses.map((address) => (
                                                        <button
                                                            key={address.id}
                                                            type="button"
                                                            onClick={() => handleAddressSelect(address)}
                                                            className={`w-full text-left px-4 py-3.5 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all mb-1 ${selectedAddress?.id === address.id
                                                                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200'
                                                                    : ''
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-semibold text-gray-900">
                                                                            {address.address_line}
                                                                        </span>
                                                                        {address.is_default && (
                                                                            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-2 py-0.5 rounded-full shrink-0">
                                                                                Mặc định
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-gray-600">
                                                                        {formatAddress(address)}
                                                                    </p>
                                                                    {address.postal_code && (
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            Mã: {address.postal_code}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}

                                                    <div className="border-t border-gray-200 mt-2 pt-2">
                                                        <button
                                                            onClick={() => navigate('/add/addresses')}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-medium"
                                                        >
                                                            <PlusCircle className="w-4 h-4" />
                                                            Thêm địa chỉ mới
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cart Items - GIẢM Z-INDEX XUỐNG THẤP */}
                        <div className="space-y-4 relative z-10">
                            {cart.items && cart.items.length > 0 ? (
                                cart.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6 transition-all hover:shadow-2xl group relative z-10"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-xl transition-shadow">
                                                <img
                                                    src={
                                                        item.Product?.images && item.Product.images.length > 0
                                                            ? item.Product.images[0].url
                                                            : 'https://via.placeholder.com/150'
                                                    }
                                                    alt={item.Product?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                                                    {item.Product?.name}
                                                </h3>
                                                <div className="flex items-center gap-3 mb-3">
                                                    {item.color && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs text-gray-500">Màu:</span>
                                                            <div
                                                                className="w-5 h-5 rounded-full border-2 border-white shadow-md"
                                                                style={{ backgroundColor: item.color }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                    {item.size && (
                                                        <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                            <span className="text-xs text-gray-500">Size:</span>
                                                            <span className="text-xs font-semibold text-gray-700">
                                                                {item.size}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                                        {Number(item.price).toLocaleString()}đ
                                                    </span>
                                                    {item.Product?.original_price && (
                                                        <>
                                                            <span className="text-gray-400 line-through text-sm">
                                                                {Number(item.Product.original_price).toLocaleString()}đ
                                                            </span>
                                                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                                                                -
                                                                {Math.round(
                                                                    (1 -
                                                                        Number(item.price) /
                                                                        Number(item.Product.original_price)) *
                                                                    100
                                                                )}
                                                                %
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* <button
                                                    onClick={() => toggleFavorite(item.id)}
                                                    className={`p-2.5 rounded-xl transition-all ${favorites.has(item.id)
                                                            ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <Heart
                                                        className="w-5 h-5"
                                                        fill={favorites.has(item.id) ? 'currentColor' : 'none'}
                                                    />
                                                </button> */}
<FavoriteButton 
    productId={item.Product?.id} 
    size="small"
/>
                                                <button
                                                    onClick={() => dispatch(removeFromCart(item.id))}
                                                    className="p-2.5 rounded-xl bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>

                                                <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1">
                                                    <button
                                                        onClick={() => {
                                                            dispatch(updateQuantity(item.id, Math.max(1, item.qty - 1)));
                                                            setCouponCode('');
                                                        }}
                                                        className="w-8 h-8 rounded-xl bg-white hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-all shadow-sm"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-lg font-bold min-w-[2.5rem] text-center">
                                                        {item.qty}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            dispatch(updateQuantity(item.id, item.qty + 1));
                                                            setCouponCode('');
                                                        }}
                                                        className="w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center text-white transition-all shadow-md"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-12 text-center relative z-10">
                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <ShoppingBag className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 text-lg mb-5">Giỏ hàng của bạn đang trống</p>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                                    >
                                        Tiếp tục mua sắm
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div
                            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 sticky"
                            style={{ top: '2rem' }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Tóm tắt đơn hàng</h2>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-700">
                                    <span>Tạm tính</span>
                                    <span className="font-semibold">{subtotal.toLocaleString()}đ</span>
                                </div>

                                <div className="flex justify-between text-gray-700">
                                    <span>Phí vận chuyển</span>
                                    <span className="flex items-center gap-2 font-semibold">
                                        {loadingShipping ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                                        ) : (
                                            shippingFee.toLocaleString()
                                        )}
                                        đ
                                    </span>
                                </div>

                                <div className="flex justify-between text-gray-700">
                                    <span>Thuế</span>
                                    <span className="font-semibold">{tax.toLocaleString()}đ</span>
                                </div>

                                {cart.discount > 0 && (
                                    <div className="flex justify-between text-green-600 bg-green-50 p-3 rounded-xl">
                                        <span className="font-medium">Giảm giá</span>
                                        <span className="font-bold">-{cart.discount.toLocaleString()}đ</span>
                                    </div>
                                )}

                                <div className="border-t-2 border-gray-200 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                            {total.toLocaleString()}đ
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedAddress && (
                                <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-indigo-600" />
                                        Giao hàng đến:
                                    </h3>
                                    <p className="text-sm text-gray-700 font-medium">{selectedAddress.name_order + " - " + selectedAddress.phone_order}</p>
                                    <p className="text-sm text-gray-600">{formatAddress(selectedAddress)}</p>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Mã giảm giá</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <TicketPercent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            type="text"
                                            placeholder="Nhập mã"
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="shrink-0 px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                                    >
                                        Áp dụng
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    onClick={() => navigate('/checkout')}
                                    disabled={!selectedAddress || !cart.items || cart.items.length === 0}
                                >
                                    Tiến hành thanh toán
                                </button>
                                <button
                                    className="w-full border-2 border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 font-semibold py-4 px-6 rounded-2xl transition-all"
                                    onClick={() => navigate('/')}
                                >
                                    Tiếp tục mua sắm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingCart;