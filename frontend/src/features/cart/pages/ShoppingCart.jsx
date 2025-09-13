import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Minus, Plus } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
import { fetchCart, updateQuantity, removeFromCart, clearCart } from "../../../redux/action/cartAction";

const ShoppingCart = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector(state => state.cart.items);
    console.log("cartItems in Redux:", cartItems);

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

    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
    const shipping = 2.00;
    const tax = 4.00;
    const total = subtotal + shipping + tax;

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
                                    {/* Product Image Placeholder */}
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                                        {item.image || "🛍️"}
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                        <div className="flex items-center mt-2">
                                            <span className="text-sm text-gray-500 mr-2">Color:</span>
                                            <div
                                                className="w-4 h-4 rounded border border-gray-300"
                                                style={{ backgroundColor: item.color || "#eee" }}
                                            ></div>
                                        </div>
                                        <div className="text-xl font-bold text-gray-900 mt-2">
                                            ${Number(item.price).toFixed(2)}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-3">
                                        {/* Favorite Button */}
                                        <button
                                            onClick={() => toggleFavorite(item.id)}
                                            className={`p-2 rounded-full hover:bg-gray-100 ${favorites.has(item.id) ? 'text-red-500' : 'text-gray-400'
                                                }`}
                                        >
                                            <Heart className="w-5 h-5" fill={favorites.has(item.id) ? 'currentColor' : 'none'} />
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => dispatch(removeFromCart(item.id))}
                                            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => dispatch(updateQuantity(item.id, Math.max(1, item.qty - 1)))}
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-lg font-semibold min-w-[2rem] text-center">
                                                {item.qty}
                                            </span>
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

                {/* Order Summary Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                        <div className="space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>${shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <hr className="border-gray-200" />
                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <button className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-lg transition duration-200">
                                Buy Now
                            </button>
                            <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg transition duration-200">
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ShoppingCart;
