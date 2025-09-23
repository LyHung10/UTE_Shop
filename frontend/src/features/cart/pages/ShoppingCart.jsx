import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Minus, Plus } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
import { fetchCart, updateQuantity, removeFromCart } from "../../../redux/action/cartAction";
import { useNavigate } from "react-router-dom";

const ShoppingCart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Lấy items từ Redux, mặc định là mảng
    const cartItems = useSelector(state => state.cart.items) || [];

    // Tính subtotal an toàn
    const subtotal = cartItems.reduce((sum, item) => {
        return sum + (Number(item.price) * item.qty);
    }, 0);
    const shipping = 20000; // ví dụ VND
    const tax = 40000;
    const total = subtotal + shipping + tax;

    const [favorites, setFavorites] = useState(new Set());

    // Khi load trang -> fetch cart từ server
    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    const toggleFavorite = (id) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            newFavorites.has(id) ? newFavorites.delete(id) : newFavorites.add(id);
            return newFavorites;
        });
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items Section */}
                <div className="lg:col-span-2">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                    <div className="space-y-4">
                        {cartItems.map((item) => (
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

                                            {/* Nếu muốn hiển thị % giảm giá */}
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
                                                onClick={() => dispatch(updateQuantity(item.id, Math.max(1, item.qty - 1)))}
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-lg font-semibold min-w-[2rem] text-center">{item.qty}</span>
                                            <button
                                                onClick={() => dispatch(updateQuantity(item.id, item.qty + 1))}
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
                            <hr className="border-gray-200" />
                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                <span>Total</span>
                                <span>{total.toLocaleString()} VND</span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <button
                                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-lg transition duration-200"
                                onClick={() => navigate("/checkout")}>
                                Buy Now
                            </button>
                            <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg transition duration-200"
                                onClick={() => navigate("/")}>
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
