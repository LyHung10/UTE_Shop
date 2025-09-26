import React, { useState } from 'react';
import { Heart, Trash2, Minus, Plus, TicketPercent, Loader2 } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
import {updateQuantity, removeFromCart, fetchCart} from "@/redux/action/cartAction.jsx";
import { useNavigate } from "react-router-dom";

const ShoppingCart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const cart = useSelector(state => state.cart);
    // --- Coupon UI state ---
    const [couponCode, setCouponCode] = useState("");

    const [favorites, setFavorites] = useState(new Set());
    const toggleFavorite = (id) => {
        setFavorites(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const handleApplyCoupon = () => {
        dispatch(fetchCart(couponCode));
    }
    // --- Tính toán tổng ---
    const subtotal = Number(cart.finalTotal || 0);
    let shipping = 20000;
    let tax = 40000;
    let total = 0;
    if (subtotal ===0)
    {
        shipping = 0;
        tax = 0;
    }
    else
    {
        total = Math.max(0, subtotal - cart.discount + shipping + tax);
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items Section */}
                <div className="lg:col-span-2">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                    <div className="space-y-4">
                        {cart.items.map((item) => (
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
                                            {/* Giá hiện tại */}
                                            <span className="text-xl text-red-600">
                        đ{Number(item.price).toLocaleString()}
                      </span>

                                            {/* Giá gốc */}
                                            {item.Product?.original_price && (
                                                <span className="text-gray-400 line-through text-sm">
                          đ{Number(item.Product.original_price).toLocaleString()}
                        </span>
                                            )}

                                            {/* % giảm giá */}
                                            {item.Product?.original_price && (
                                                <span className="bg-red-100 text-red-600 text-xs font-semibold px-1.5 py-0.5 rounded">
                          -{Math.round((1 - Number(item.price) / Number(item.Product.original_price)) * 100)}%
                        </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-3">
                                        {/* Favorite */}
                                        <button
                                            onClick={() => toggleFavorite(item.id)}
                                            className={`p-2 rounded-full hover:bg-gray-100 ${favorites.has(item.id) ? 'text-red-500' : 'text-gray-400'}`}
                                        >
                                            <Heart className="w-5 h-5" fill={favorites.has(item.id) ? 'currentColor' : 'none'} />
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={() => dispatch(removeFromCart(item.id))}
                                            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>

                                        {/* Quantity */}
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => {dispatch(updateQuantity(item.id, Math.max(1, item.qty - 1)))
                                                                        setCouponCode("")}}
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-lg font-semibold min-w-[2rem] text-center">{item.qty}</span>
                                            <button
                                                onClick={() => {dispatch(updateQuantity(item.id, item.qty + 1))
                                                    setCouponCode("")}}
                                                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-900 flex items-center justify-center text-white"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky" style={{ top: '212px' }}>
                        <div className="space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{subtotal.toLocaleString()} VND</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>{shipping.toLocaleString()} VND</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax</span>
                                <span>{tax.toLocaleString()} VND</span>
                            </div>

                            {/* Discount line (ẩn nếu chưa có) */}
                            {cart.discount > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Voucher</span>
                                    <span>-{cart.discount.toLocaleString()} VND</span>
                                </div>
                            )}

                            <hr className="border-gray-200" />
                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                <span>Total</span>
                                <span>{total.toLocaleString()} VND</span>
                            </div>
                        </div>

                        {/* ----- Coupon UI (thêm mới) ----- */}
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
                                    onClick={() => handleApplyCoupon()}
                                    className="shrink-0 px-4 py-2 rounded-lg font-semibold text-white bg-gray-800 hover:bg-gray-900 disabled:opacity-70 flex items-center gap-2"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </div>
                        {/* ----- End Coupon UI ----- */}

                        <div className="mt-8 space-y-4">
                            <button
                                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-lg transition duration-200"
                                onClick={() => navigate("/checkout")}>
                                Buy Now
                            </button>
                            <button
                                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg transition duration-200"
                                onClick={() => navigate("/")}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingCart;
