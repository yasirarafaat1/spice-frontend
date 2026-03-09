import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { useNavigation } from "../utils/navigation";
import { useAuth } from '../context/AuthContext';

interface CartPageProps {
    onBack?: () => void;
}

export default function CartPage({ onBack }: CartPageProps) {
    const { go } = useNavigation();
    const { isAuthenticated } = useAuth();

    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        buyNow,
    } = useCart();
    const [productStocks, setProductStocks] = useState<Record<number, number>>({});

    // Fetch stock information for cart items
    useEffect(() => {
        // Only fetch if user is authenticated
        if (!isAuthenticated) return;

        const fetchStocks = async () => {
            const stocks: Record<number, number> = {};

            for (const item of cartItems) {
                try {
                    const response = await productAPI.getProductById(item.id);
                    if (response.data.status === 200 && response.data.data && response.data.data.length > 0) {
                        const product = response.data.data[0];
                        stocks[item.id] = product.quantity || 0;
                    } else {
                        stocks[item.id] = 0;
                    }
                } catch (error) {
                    console.error(`Failed to fetch stock for product ${item.id}:`, error);
                    stocks[item.id] = item.stock || 0;
                }
            }

            setProductStocks(stocks);

            // Auto-adjust quantities and remove out-of-stock items
            for (const item of cartItems) {
                const availableStock = stocks[item.id] ?? item.stock ?? 0;
                if (availableStock < 1) {
                    // Remove out-of-stock items
                    removeFromCart(item.id);
                } else if (item.quantity > availableStock) {
                    // Adjust quantity to available stock
                    updateQuantity(item.id, availableStock);
                }
            }

        };

        if (cartItems.length > 0) {
            fetchStocks();
        }
    }, [cartItems, removeFromCart, updateQuantity, isAuthenticated]);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            go('/');
        }
    };

    // Handle login button click - save current path before redirecting
    const handleLoginClick = () => {
        // Save the current path to redirect back after login
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('redirectAfterLogin', currentPath);
        go('/log');
    };

    // Show login message if user is not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold text-white mb-4">Please log in</h2>
                    <p className="text-white mb-6">You need to be logged in to view your cart.</p>
                    <button
                        onClick={handleLoginClick}
                        className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-white hover:text-amber-700 transition-colors mb-8"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Continue Shopping</span>
                    </button>

                    <div className="bg-black rounded-2xl shadow-lg p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <ShoppingBag size={80} className="mx-auto text-white mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
                            <p className="text-white mb-8">
                                Looks like you haven't added anything to your cart yet.
                            </p>
                            <button
                                onClick={handleBack}
                                className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Start Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-white hover:text-amber-700 transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Continue Shopping</span>
                </button>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
                    <span className="text-white">
                        {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                    </span>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 border border-white/10 rounded-lg p-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-3 space-y-6">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-black rounded-xl shadow-md p-6 flex flex-col sm:flex-row gap-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex-shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-white mb-2">
                                                    {item.name}
                                                </h3>
                                                <p className="text-2xl font-bold text-amber-700 mb-2">
                                                    ₹{item.price.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        // Buy now this specific item
                                                        buyNow(item.id);
                                                        // Navigate to checkout with state
                                                        go('/checkout', { state: { buyNowItemId: item.id } });
                                                    }}
                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                                                >
                                                    Buy Now
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        {productStocks[item.id] !== undefined && (
                                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${productStocks[item.id] >= 1
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {productStocks[item.id] >= 1
                                                    ? `In Stock`
                                                    : 'Out of Stock'
                                                }
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-4 text-white">
                                        <div className="flex flex-col gap-2">
                                        {/* Quantity controls */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                aria-label="Decrease quantity"
                                            >
                                                -
                                            </button>
                                            <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const available = productStocks[item.id] ?? item.stock ?? item.quantity + 1;
                                                    if (item.quantity < available) {
                                                        updateQuantity(item.id, item.quantity + 1);
                                                    }
                                                }}
                                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                            {/* <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                                                <a
                                                    href="https://wa.me/917652087193?text=Hi%20Abdulla%20Islamic%20Store%2C%20I%20came%20across%20your%20website%20and%20would%20like%20to%20discuss%20about%20products."
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs sm:text-sm text-amber-800 font-medium hover:text-amber-900 hover:underline"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        className="text-green-600"
                                                    >
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                    <span>For bulk order contact on whatsapp</span>
                                                </a>
                                            </div> */}

                                        </div>

                                        <div className="flex items-center">
                                            <span className="text-xl font-bold text-white">
                                                ₹{(item.price * 1).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={clearCart}
                            className="text-red-600 hover:text-red-700 font-medium transition-colors"
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
