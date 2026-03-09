import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import AddressForm from '../components/AddressForm';
import { ArrowLeft, Mail, Phone, MapPin, Home, Building, Plus, Edit, User, Package, Heart, Settings } from 'lucide-react';
import { useNavigation } from "../utils/navigation";
import { getUsernameFromEmail } from '../utils/userUtils'; // Import the utility function

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

export default function ProfilePage({ onBack }: { onBack?: () => void }) {
    const { go } = useNavigation();

    const { user, isAuthenticated, logout } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [activeTab, setActiveTab] = useState('profile'); // Add state for active tab

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
    }, [isAuthenticated]);

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
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back</span>
                </button>

                {/* Main Content Area - Flex row for desktop, column for mobile */}
                <div className="flex flex-col lg:flex-row gap-8 flex-grow">
                    {/* Fixed Left Sidebar - Hidden on mobile */}
                    <div className="lg:w-1/4 hidden lg:block">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12 flex items-center justify-center">
                                    <User size={20} className="text-gray-500" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">{getUsernameFromEmail(user?.email)}</h2>
                                    <p className="text-sm text-gray-500 truncate max-w-[150px]">{user?.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'profile' ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <User size={20} />
                                    Profile
                                </button>

                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'orders' ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <Package size={20} />
                                    My Orders
                                </button>

                                <button
                                    onClick={() => setActiveTab('wishlist')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'wishlist' ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <Heart size={20} />
                                    My Wishlist
                                </button>

                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'settings' ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <Settings size={20} />
                                    Settings
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:w-3/4 flex-grow">
                        {/* Profile Header - Only shown in profile tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                                <div className="px-6 py-8">
                                    <div className="flex flex-col items-center">
                                        {/* Avatar */}
                                        <div className="bg-gray-200 border-2 border-dashed rounded-full w-20 h-20 flex items-center justify-center mb-4">
                                            <User size={32} className="text-gray-500" />
                                        </div>

                                        {/* Profile Title */}
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                            {getUsernameFromEmail(user?.email)}
                                        </h1>

                                        {/* Verified Email */}
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-gray-500" />
                                            <span className="text-gray-700">{user?.email}</span>
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Verified
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Content based on active tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                {/* Divider */}
                                <div className="border-t border-gray-200"></div>

                                {/* Profile Content */}
                                <div className="p-6">
                                    {/* Quick Links Section */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                        <button
                                            onClick={() => go('/orders')}
                                            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-amber-100 p-2 rounded-lg">
                                                    <Package className="h-6 w-6 text-amber-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">My Orders</h3>
                                                    <p className="text-sm text-gray-500">View your order history</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => go('/wishlist')}
                                            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-amber-100 p-2 rounded-lg">
                                                    <Heart className="h-6 w-6 text-amber-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">My Wishlist</h3>
                                                    <p className="text-sm text-gray-500">View your saved items</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Addresses</h2>
                                    <button
                                        onClick={() => {
                                            setEditingAddress(null);
                                            setShowAddressForm(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-amber-600 hover:bg-amber-700 text-white"
                                    >
                                        <Plus size={16} />
                                        Add Address
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                                    </div>
                                ) : error ? (
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                                        <p className="text-red-700">{error}</p>
                                        {error.includes('Authentication') && (
                                            <p className="text-red-500 text-sm mt-2">Redirecting to login page...</p>
                                        )}
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                                        <p className="text-gray-500 mb-6">Add your first address to get started</p>
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
                                                            <h3 className="font-semibold text-gray-900">{address.FullName}</h3>
                                                            {address.addressType === 'home' ? (
                                                                <Home size={16} className="text-amber-600" />
                                                            ) : (
                                                                <Building size={16} className="text-amber-600" />
                                                            )}
                                                            <span className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full capitalize">
                                                                {address.addressType}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-2 text-gray-600">
                                                            <p className="flex items-start gap-2">
                                                                <MapPin size={16} className="flex-shrink-0 mt-0.5 text-gray-400" />
                                                                <span className="text-sm">
                                                                    {address.address}, {address.city}, {address.state}, {address.country} - {address.pinCode}
                                                                </span>
                                                            </p>
                                                            <p className="flex items-center gap-2">
                                                                <Phone size={16} className="flex-shrink-0 text-gray-400" />
                                                                <span className="text-sm">{address.phone1}</span>
                                                                {address.phone2 && <span className="text-sm">/ {address.phone2}</span>}
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
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                            <button
                                onClick={logout}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Dialog for Address Form */}
            {showAddressForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <AddressForm
                            address={editingAddress || undefined}
                            onSubmit={handleAddressSubmit}
                            onCancel={handleAddressCancel}
                        />
                    </div>
                </div>
            )}

            {/* Bottom Navigation Tabs for Mobile */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
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
                        <Settings size={20} />
                        <span className="text-xs mt-1">Settings</span>
                    </button>
                </div>
            </div>
            {/* Add padding to prevent content overlap on mobile */}
            <div className="lg:hidden h-16"></div>
        </div>
    );
}