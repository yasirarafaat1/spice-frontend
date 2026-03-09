import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import AddressForm from '../components/AddressForm';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Plus,
    Edit,
    User,
    Heart,
    Settings as SettingsIcon,
    ShoppingCart,
    X,
    LogOut,
    Shield,
    Globe,
    Package,
    Calendar
} from 'lucide-react';
import { useNavigation } from "../utils/navigation";
import { getUsernameFromEmail } from '../utils/userUtils';
import { useAuthProtection } from '../utils/authProtection';

// We'll replicate the content of each page directly in this component to avoid circular dependencies

// Interfaces for Settings tab
// interface SettingsAddress {
//   id: number;
//   FullName: string;
//   phone1: string;
//   phone2: string | null;
//   country: string;
//   state: string;
//   city: string;
//   pinCode: string;
//   address: string;
//   addressType: string;
// }

// Interface for Profile tab
interface Address {
    id: number;
    FullName: string;
    phone1: string;
    phone2: string | null;
    country: string;
    state: string;
    city: string;
    pinCode: string;
    address: string;
    addressType: string;
    createdAt: string;
    updatedAt: string;
    user_id: string;
}

// Interface for Wishlist product
interface WishlistProduct {
    product_id: number;
    name: string;
    selling_price: number;
    product_image: string | string[] | { [key: string]: string };
    quantity: number;
    Catagory?: {
        name: string;
    };
}

// Add Order interfaces
interface Product {
    product_id: number;
    name: string;
    price: number;
    selling_price?: number;
    product_image: string | string[] | { [key: string]: string };
    description?: string;
}

interface OrderItem {
    order_item_id: number;
    order_id: string;
    product_id: number;
    quantity: number;
    price: string;
    Product: Product;
}

interface Order {
    order_id: string;
    FullName: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    phone1: string;
    phone2?: string;
    createdAt: string;
    status?: string;
    totalAmount: string;
    payment_method?: string;
    payu_transaction_id?: string;
    addressType?: string; // Add addressType property
    Product?: Product;
    items?: OrderItem[];
}

export default function ProfilePageTabs({ onBack }: { onBack?: () => void }) {
    const { go } = useNavigation();
    const { user, isAuthenticated, logout } = useAuth();
    const [profileName, setProfileName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Profile tab states
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    // Wishlist tab states and functions
    const { wishlistItems } = useWishlist();
    const { addToCart } = useCart();

    // Orders tab states and functions
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    // Settings tab states and functions
    const { saveCartToLocalStorage } = useCart();

    // Add helper functions for orders
    const getProductImage = (product?: Product) => {
        if (!product || !product.product_image) return '';

        if (typeof product.product_image === 'string') {
            return product.product_image;
        } else if (Array.isArray(product.product_image)) {
            return product.product_image[0] || '';
        } else if (typeof product.product_image === 'object' && product.product_image !== null) {
            const imageValues = Object.values(product.product_image);
            return imageValues[0] || '';
        }

        return '';
    };

    const getProductPrice = (product?: Product) => {
        if (!product) return 0;

        if (typeof product.selling_price === 'number' && !isNaN(product.selling_price) && product.selling_price > 0) {
            return product.selling_price;
        } else if (typeof product.price === 'number' && !isNaN(product.price) && product.price > 0) {
            return product.price;
        }

        return 0;
    };

    const handleOrderClick = (orderId: string) => {
        go(`/order/${orderId}`);
    };

    useAuthProtection();

    const fetchOrdersData = async () => {
        if (activeTab !== 'orders') return;

        try {
            setOrdersLoading(true);
            setOrdersError(null);
            const response = await userAPI.getOrders();

            // Handle the case where backend returns empty response
            if (!response || !response.data) {
                setOrders([]);
            } else {
                // Check if response has orders property or is an array directly
                let ordersData: Order[] = [];
                if (Array.isArray(response.data)) {
                    ordersData = response.data;
                } else if (response.data.orders && Array.isArray(response.data.orders)) {
                    ordersData = response.data.orders;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    // Handle case where orders are in data.data (nested)
                    ordersData = response.data.data;
                }

                setOrders(ordersData);
            }
        } catch (error: unknown) {
            // Type guard for axios error
            if (error && typeof error === 'object' && 'request' in error) {
                const axiosError = error as { message?: string; response?: { status?: number }; request?: unknown };

                // Check if it's a network error
                if (!axiosError.response && axiosError.request) {
                    setOrdersError('Check your internet connection');
                }
                // Check if it's a backend error (5xx)
                else if (axiosError.response?.status && axiosError.response.status >= 500) {
                    setOrdersError('We will fix it soon');
                }
                // Handle 404 specifically
                else if (axiosError.response?.status === 404) {
                    setOrdersError('Order service is currently unavailable. Please try again later.');
                }
                // For other errors
                else {
                    const errorMessage = axiosError.message || 'Failed to fetch orders. Please try again.';
                    setOrdersError(errorMessage);
                }
            } else {
                setOrdersError('Failed to fetch orders. Please try again.');
            }

            // Set orders to empty array on error to avoid showing stale data
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!isAuthenticated) return;

            try {
                setLoading(true);
                setError(null);
                const response = await userAPI.getAddresses();

                if (response.data.status && Array.isArray(response.data.data)) {
                    setAddresses(response.data.data);
                } else {
                    setAddresses([]);
                }
            } catch (err: unknown) {
                console.error('Failed to fetch addresses:', err);
                // Check if it's an authentication error
                if (typeof err === 'object' && err !== null && 'response' in err) {
                    const axiosError = err as { response?: { status?: number } };
                    if (axiosError.response?.status === 403) {
                        setError('Authentication required. Please log in again.');
                        // Redirect to login page
                        setTimeout(() => {
                            go('/log');
                        }, 2000);
                    } else {
                        setError('Failed to load addresses. Please try again later.');
                    }
                } else {
                    setError('Failed to load addresses. Please try again later.');
                }
                setAddresses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
        loadProfileName();
        if (activeTab === 'orders') {
            fetchOrdersData();
        }
    }, [isAuthenticated, activeTab]);

    const loadProfileName = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await userAPI.getProfile(user?.email);
            const name = res.data?.profile?.name || '';
            setProfileName(name);
        } catch (err) {
            console.warn('Failed to load profile name');
        }
    };

    const saveProfileName = async () => {
        if (!isAuthenticated) return;
        setIsSavingName(true);
        try {
            await userAPI.updateProfile({ name: profileName, email: user?.email });
            setIsEditingName(false);
        } catch (err) {
            console.warn('Failed to save profile name');
        } finally {
            setIsSavingName(false);
        }
    };

    const loadAddresses = async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);
            const response = await userAPI.getAddresses();

            if (response.data.status && Array.isArray(response.data.data)) {
                setAddresses(response.data.data);
            } else {
                setAddresses([]);
            }
        } catch (err: unknown) {
            console.error('Failed to fetch addresses:', err);
            setError('Failed to load addresses. Please try again later.');
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
        loadAddresses(); // Refresh the address list
    };

    const handleAddressCancel = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
    };

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
        localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
        go('/log');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="bg-black rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold text-white mb-4">Please log in</h2>
                    <p className="text-white mb-6">You need to be logged in to view your profile.</p>
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

    // Render content based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        {/* Profile Header */}
                        <div className="bg-black rounded-2xl shadow-lg p-6">
                            <div className="flex flex-col items-center">
                                <div className="bg-gray-200 border-2 border-dashed rounded-full w-20 h-20 flex items-center justify-center mb-4">
                                    <User size={32} className="text-black" />
                                </div>

                                <div className="flex items-center gap-3 mb-3">
                                    {isEditingName ? (
                                        <input
                                            type="text"
                                            value={profileName}
                                            onChange={(e) => setProfileName(e.target.value)}
                                            placeholder={getUsernameFromEmail(user?.email)}
                                            className="text-2xl font-bold text-black text-center px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                                        />
                                    ) : (
                                        <h1 className="text-2xl font-bold text-white">
                                            {profileName || getUsernameFromEmail(user?.email)}
                                        </h1>
                                    )}
                                    <button
                                        onClick={() => setIsEditingName((prev) => !prev)}
                                        className="p-2 border text-white border-white rounded-lg hover:text-black hover:bg-gray-50"
                                        aria-label="Edit name"
                                    >
                                        <Edit size={16} />
                                    </button>
                                </div>

                                {isEditingName && (
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            onClick={saveProfileName}
                                            disabled={isSavingName}
                                            className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-60 transition-colors"
                                        >
                                            {isSavingName ? 'Saving...' : 'Save Name'}
                                        </button>
                                        <button
                                            onClick={() => setProfileName(getUsernameFromEmail(user?.email))}
                                            className="px-4 py-2 border border-white text-white rounded-lg hover:text-black hover:bg-gray-50"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mb-1">
                                    <Mail size={16} className="text-white" />
                                    <span className="text-white">{user?.email}</span>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        Verified
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Address Management */}
                        <div className="bg-black rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Manage Addresses</h2>
                                <button
                                    onClick={() => {
                                        setEditingAddress(null);
                                        setShowAddressForm(true);
                                    }}
                                    className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    <Plus size={16} />
                                    Add Address
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-red-700">{error}</p>
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-8">
                                    <MapPin size={48} className="mx-auto text-white mb-4" />
                                    <h3 className="text-lg font-medium text-white mb-2">No addresses yet</h3>
                                    <p className="text-white mb-6">Add your first address to get started</p>
                                    <button
                                        onClick={() => {
                                            setEditingAddress(null);
                                            setShowAddressForm(true);
                                        }}
                                        className="px-4 py-2 rounded-lg font-medium transition-colors bg-amber-600 hover:bg-amber-700 text-white"
                                    >
                                        Add Address
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {addresses.map((address) => (
                                        <div key={address.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <h3 className="font-semibold text-white">{address.FullName}</h3>
                                                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full capitalize">
                                                            {address.addressType}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1 text-white text-sm">
                                                        <p className="flex items-start gap-2">
                                                            <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                                                            {address.address}, {address.city}, {address.state}, {address.country} - {address.pinCode}
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <Phone size={16} className="flex-shrink-0" />
                                                            {address.phone1}
                                                            {address.phone2 && ` / ${address.phone2}`}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setEditingAddress(address);
                                                        setShowAddressForm(true);
                                                    }}
                                                    className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1 p-2 rounded-lg hover:bg-amber-50 transition-colors"
                                                >
                                                    <Edit size={16} />
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button
                                onClick={logout}
                                className="flex-1 bg-black hover:bg-gray-200 text-white py-3 rounded-lg font-semibold transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                );
            case 'orders': {
                return (
                    <div className="bg-black rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-8">
                            <Package className="text-amber-700" size={32} />
                            <h1 className="text-3xl font-bold text-white">My Orders</h1>
                        </div>

                        {ordersLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
                            </div>
                        ) : ordersError ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl shadow-md p-8 text-center">
                                <Package size={80} className="mx-auto text-red-300 mb-6" />
                                <h2 className="text-2xl font-bold text-red-900 mb-4">Error Loading Orders</h2>
                                <p className="text-red-700 mb-6">{ordersError}</p>
                                <button
                                    onClick={() => {
                                        // Reset loading and error states
                                        setOrdersLoading(true);
                                        setOrdersError(null);
                                        // Fetch orders again
                                        fetchOrdersData();
                                    }}
                                    className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-black rounded-xl shadow-md p-12 text-center">
                                <Package size={80} className="mx-auto text-gray-300 mb-6" />
                                <h2 className="text-2xl font-bold text-white mb-4">No orders yet</h2>
                                <p className="text-gray-400 mb-8">
                                    You haven't placed any orders yet. Start shopping to see your orders here.
                                </p>
                                <button
                                    onClick={() => go('/')} // Navigate to home page
                                    className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => {
                                    // Get product image from items or Product
                                    const productImage = order.items && order.items.length > 0
                                        ? getProductImage(order.items[0].Product)
                                        : (order.Product ? getProductImage(order.Product) : '');

                                    // Get product name from items or Product
                                    const productName = order.items && order.items.length > 0
                                        ? (order.items[0].Product?.name || `Order #${order.order_id.slice(0, 8)}`)
                                        : (order.Product?.name || `Order #${order.order_id.slice(0, 8)}`);

                                    // Calculate total price from items or Product
                                    let totalPrice = 0;
                                    if (order.items && order.items.length > 0) {
                                        totalPrice = order.items.reduce((sum, item) =>
                                            sum + (getProductPrice(item.Product) * item.quantity), 0);
                                    } else if (order.Product) {
                                        totalPrice = getProductPrice(order.Product);
                                    }

                                    return (
                                        <div
                                            key={order.order_id}
                                            className="bg-black rounded-xl shadow-md p-4 md:p-6 cursor-pointer hover:shadow-lg transition-shadow"
                                            onClick={() => handleOrderClick(order.order_id)}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                {/* Image and Name */}
                                                <div className="flex items-center gap-4 flex-1">
                                                    {productImage && (
                                                        <div className="flex-shrink-0">
                                                            <img
                                                                src={productImage}
                                                                alt={productName}
                                                                className="w-16 h-16 object-cover rounded-lg"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="text-base md:text-lg font-semibold text-white">
                                                            {productName}
                                                        </h3>
                                                        <p className="text-xs md:text-sm text-gray-400 flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Desktop: Price and Status */}
                                                <div className="hidden md:flex items-center justify-between gap-8 flex-1">
                                                    <div className="text-center">
                                                        <p className="font-medium text-gray-900 text-base md:text-lg">
                                                            ₹{totalPrice.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs md:text-sm text-gray-600">
                                                            <span className="font-medium">
                                                                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mobile: Price and Status at the bottom */}
                                            <div className="md:hidden flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                                <div className="text-left flex flex-row items-center justify-center gap-2">
                                                    <p className="font-medium text-gray-900 text-base">
                                                        ₹{totalPrice.toFixed(2)}
                                                    </p>
                                                    <div className="text-right">
                                                        <h4 className="text-xs text-gray-600">
                                                            <span className="font-medium">
                                                                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                                                            </span>
                                                        </h4>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            }
            case 'wishlist': {
                const handleRemoveFromWishlist = async () => {
                    // Implementation would go here if we had access to removeFromWishlist
                    // For now, we'll just log it
                };

                const handleAddToCartFromWishlist = async (product: WishlistProduct) => {
                    try {
                        await addToCart(product.product_id, {
                            name: product.name,
                            price: product.selling_price,
                            image: typeof product.product_image === 'string' ? product.product_image : Array.isArray(product.product_image) ? product.product_image[0] : Object.values(product.product_image)[0]
                        });
                    } catch (error) {
                        console.error('Failed to add to cart:', error);
                    }
                };

                return (
                    <div className="bg-black rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-8">
                            <Heart className="text-amber-700" size={32} />
                            <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
                        </div>

                        {wishlistItems.length === 0 ? (
                            <div className="bg-black rounded-xl shadow-md p-8 text-center">
                                <Heart size={48} className="text-gray-300 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">Your wishlist is empty</h2>
                                <p className="text-gray-600 mb-6">Start adding items you love to your wishlist</p>
                                <button
                                    onClick={() => go('/')} // Navigate to home page
                                    className="bg-amber-700 hover:bg-amber-800 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {wishlistItems.map((product: WishlistProduct) => (
                                    <div key={product.product_id} className="bg-black rounded-xl shadow-md overflow-hidden relative">
                                        <button
                                            onClick={() => handleRemoveFromWishlist()}
                                            className="absolute top-3 right-3 bg-black rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10"
                                        >
                                            <X size={20} className="text-gray-600" />
                                        </button>

                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                                            <p className="text-amber-700 font-bold">₹{product.selling_price}</p>
                                        </div>

                                        <div className="p-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCartFromWishlist(product);
                                                }}
                                                className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <ShoppingCart size={18} />
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }
            case 'settings': {
                const handleLogout = () => {
                    saveCartToLocalStorage();
                    logout();
                };

                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

                        {/* Account Settings */}
                        <div className="bg-black rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <SettingsIcon className="text-amber-700" size={24} />
                                <h2 className="text-2xl font-bold text-white">
                                    Account Settings
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium bg-black text-gray-400 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Privacy & Security */}
                        <div className="bg-black rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="text-amber-700" size={24} />
                                <h2 className="text-2xl font-bold text-white">
                                    Privacy & Security
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <button
                                    onClick={() => go('/privacy')}
                                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <p className="font-medium text-white">Privacy Policy</p>
                                    <p className="text-sm text-white">Read our privacy policy</p>
                                </button>
                            </div>
                        </div>

                        {/* Terms & Policy */}
                        <div className="bg-black rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="text-amber-700" size={24} />
                                <h2 className="text-2xl font-bold text-white">
                                    Terms & Policy
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <button
                                    onClick={() => go('/terms')}
                                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <p className="font-medium text-white">Terms of Service</p>
                                    <p className="text-sm text-white">Read our terms of service</p>
                                </button>
                            </div>
                        </div>

                        {/* Language & Region */}
                        <div className="bg-black rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Globe className="text-amber-700" size={24} />
                                <h2 className="text-2xl font-bold text-white">
                                    Language & Region
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Language
                                </label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none">
                                    <option>English</option>
                                    <option>Arabic</option>
                                    <option>Urdu</option>
                                </select>
                            </div>
                        </div>

                        {/* Logout */}
                        <div className="bg-black rounded-xl shadow-md p-6">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </div>
                );
            }
            default:
                return (
                    <div className="bg-black rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900">Profile</h2>
                        <p className="text-gray-600">Select a tab to view content</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-grow">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-white hover:text-amber-700 transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back</span>
                </button>

                {/* Main Content Area - Hidden on mobile when tabs are at bottom */}
                <div className="flex flex-col lg:flex-row gap-8 flex-grow">
                    {/* Fixed Left Sidebar - Hidden on mobile */}
                    <div className="lg:w-1/4 hidden lg:block">
                        <div className="bg-black rounded-2xl shadow-lg p-6 sticky top-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12 flex items-center justify-center">
                                    <User size={20} className="text-black" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white">{getUsernameFromEmail(user?.email)}</h2>
                                    <p className="text-sm text-white truncate max-w-[150px]">{user?.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-1 text-white">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'profile' ? 'bg-amber-50 text-amber-700 font-medium' : 'text-white hover:bg-black'}`}
                                >
                                    <User size={20} />
                                    Profile
                                </button>

                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'orders' ? 'bg-amber-50 text-amber-700 font-medium' : 'text-white hover:bg-black'}`}
                                >
                                    <Package size={20} />
                                    My Orders
                                </button>

                                <button
                                    onClick={() => setActiveTab('wishlist')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'wishlist' ? 'bg-amber-50 text-amber-700 font-medium' : 'text-white hover:bg-black'}`}
                                >
                                    <Heart size={20} />
                                    My Wishlist
                                </button>

                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'settings' ? 'bg-amber-50 text-amber-700 font-medium' : 'text-white hover:bg-black'}`}
                                >
                                    <SettingsIcon size={20} />
                                    Settings
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:w-3/4 flex-grow">
                        {renderTabContent()}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation Tabs for Mobile */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-200 shadow-lg">
                <div className="grid grid-cols-4 gap-1">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex flex-col items-center justify-center py-2 px-1 ${activeTab === 'profile' ? 'text-amber-700 bg-amber-50' : 'text-gray-600'}`}
                    >
                        <User size={20} />
                        <span className="text-xs mt-1">Profile</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex flex-col items-center justify-center py-2 px-1 ${activeTab === 'orders' ? 'text-amber-700 bg-amber-50' : 'text-gray-600'}`}
                    >
                        <Package size={20} />
                        <span className="text-xs mt-1">Orders</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('wishlist')}
                        className={`flex flex-col items-center justify-center py-2 px-1 ${activeTab === 'wishlist' ? 'text-amber-700 bg-amber-50' : 'text-gray-600'}`}
                    >
                        <Heart size={20} />
                        <span className="text-xs mt-1">Wishlist</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex flex-col items-center justify-center py-2 px-1 ${activeTab === 'settings' ? 'text-amber-700 bg-amber-50' : 'text-gray-600'}`}
                    >
                        <SettingsIcon size={20} />
                        <span className="text-xs mt-1">Settings</span>
                    </button>
                </div>
            </div>

            {/* Adjust padding to accommodate the new fourth tab */}
            <div className="lg:hidden h-16"></div>

            {/* Modal Dialog for Address Form */}
            {showAddressForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-black rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <AddressForm
                            address={editingAddress || undefined}
                            onSubmit={handleAddressSubmit}
                            onCancel={handleAddressCancel}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
