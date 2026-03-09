import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Clock, Package, Truck, XCircle } from 'lucide-react';
import { getDisplayStatus } from '../Admin/components/Order/OrderStatusUtils';
import { userAPI } from '../services/api';
import { useNavigation } from '../utils/navigation';
import { getSortedMediaArray } from '../utils/mediaSortUtils';
import { useAuthProtection } from '../utils/authProtection';

interface Product {
    product_id: number;
    name: string;
    price: number;
    selling_price?: number;
    product_image: string | string[] | { [key: string]: string };
    description?: string;
}

// Add OrderItem interface
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
    payment_status?: string; // Add payment_status property
    addressType?: string; // Add addressType property
    Product?: Product;
    items?: OrderItem[]; // Add items array
}

interface OrderDetailsPageProps {
    orderId: string;
    onBack: () => void;
}

export default function OrderDetailsPage({ orderId, onBack }: OrderDetailsPageProps) {
    const { isLoading: authLoading } = useAuthProtection();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showCancelSection, setShowCancelSection] = useState(false);
    const { go } = useNavigation();

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const response = await userAPI.getOrders();

            if (response && response.data) {
                let orders: Order[] = [];

                // Handle different response structures
                if (Array.isArray(response.data)) {
                    orders = response.data;
                } else if (response.data.orders && Array.isArray(response.data.orders)) {
                    orders = response.data.orders;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    orders = response.data.data;
                }

                // Find the specific order
                const foundOrder = orders.find(o => String(o.order_id ?? o._id) === orderId);
                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    setError('Order not found');
                }
            } else {
                setError('Failed to load order details');
            }
        } catch (err) {
            console.error('Error fetching order details:', err);

            // Type guard for axios error
            if (err && typeof err === 'object' && 'request' in err) {
                const axiosError = err as { response?: { status?: number }; request?: unknown };

                // Check if it's a network error
                if (!axiosError.response && axiosError.request) {
                    setError('Check your internet connection');
                }
                // Check if it's a backend error
                else if (axiosError.response?.status && axiosError.response.status >= 500) {
                    setError('We will fix it soon');
                }
                // For other errors
                else {
                    setError('Failed to load order details. Please try again.');
                }
            } else {
                setError('Failed to load order details. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getProductImage = (product?: Product) => {
        if (!product || !product.product_image) return '';

        if (typeof product.product_image === 'string') {
            return product.product_image;
        } else if (Array.isArray(product.product_image)) {
            return product.product_image[0] || '';
        } else if (typeof product.product_image === 'object' && product.product_image !== null) {
            // Use our sorting utility to prioritize images
            const sortedMedia = getSortedMediaArray(product.product_image);
            return sortedMedia[0] || '';
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

    const handleCancelOrder = async () => {
        if (isCancelling) return;

        setIsCancelling(true);
        setCancelError(null);
        try {
            await userAPI.cancelOrder(orderId);
            // Update the order status locally to reflect the cancellation immediately
            if (order) {
                setOrder({
                    ...order,
                    status: 'cancelled'
                });
            }
            setShowCancelDialog(false);
        } catch (error) {
            console.error('Failed to cancel order:', error);

            // Type guard for axios error
            if (error && typeof error === 'object' && 'request' in error) {
                const axiosError = error as { response?: { status?: number }; request?: unknown };

                // Check if it's a network error
                if (!axiosError.response && axiosError.request) {
                    setCancelError('Check your internet connection');
                }
                // Check if it's a backend error
                else if (axiosError.response?.status && axiosError.response.status >= 500) {
                    setCancelError('We will fix it soon');
                }
                // For other errors
                else {
                    setCancelError('Failed to cancel order. Please try again.');
                }
            } else {
                setCancelError('Failed to cancel order. Please try again.');
            }
        } finally {
            setIsCancelling(false);
        }
    };

    const handleCancelConfirmation = () => {
        setShowCancelDialog(true);
    };

    const closeCancelDialog = () => {
        setShowCancelDialog(false);
    };

    const confirmCancelOrder = async () => {
        await handleCancelOrder();
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white hover:text-amber-700 transition-colors mb-8"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Orders</span>
                    </button>

                    <div className="bg-red-50 border border-red-200 rounded-xl shadow-md p-8 text-center">
                        <Package size={80} className="mx-auto text-red-300 mb-6" />
                        <h2 className="text-2xl font-bold text-red-900 mb-4">Error Loading Order</h2>
                        <p className="text-red-700 mb-6">{error}</p>
                        <button
                            onClick={fetchOrderDetails}
                            className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white hover:text-amber-700 transition-colors mb-8"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Orders</span>
                    </button>

                    <div className="bg-black rounded-xl shadow-md p-12 text-center">
                        <Package size={80} className="mx-auto text-gray-300 mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-4">Order Not Found</h2>
                        <p className="text-white mb-8">
                            The requested order could not be found.
                        </p>
                        <button
                            onClick={onBack}
                            className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const addrObj = (order as any).address && typeof (order as any).address === 'object' ? (order as any).address : null;
    const fullName = order.FullName || addrObj?.FullName || addrObj?.full_name || '--';
    const phone1 = order.phone1 || addrObj?.phone1 || addrObj?.phone || '--';
    const addressLine = order.address_line1 || addrObj?.address_line1 || addrObj?.address || (typeof order.address === 'string' ? order.address : '');
    const city = order.city || addrObj?.city || '';
    const state = order.state || addrObj?.state || '';
    const country = order.country || addrObj?.country || '';
    const pin = order.pinCode || addrObj?.pinCode || addrObj?.postal_code || '';
    const addressType = order.addressType || addrObj?.addressType || '';
    const currency = (order as any).currency || 'INR';
    const currencySymbol = currency === 'INR' ? '₹' : '$';

    // Calculate total price from items or Product
    const totalPrice = order.items && order.items.length > 0
        ? order.items.reduce((sum, item) => {
            const qtyRaw = (item as any).quantity ?? 1;
            const qty = Number(qtyRaw);
            const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
            const price = getProductPrice(item.Product || (item as any).product);
            return sum + price * safeQty;
        }, 0)
        : (order.Product ? getProductPrice(order.Product) : 0);

    // Determine the current status index for progress tracking
    const getStatusIndex = (status?: string) => {
        if (!status) return 0;

        // Normalize status string
        const normalizedStatus = status.toLowerCase().trim().replace(' ', '_').replace('-', '_');

        // For cancelled orders, show direct path from pending to cancelled
        if (normalizedStatus === 'cancelled') {
            return 1; // Show progress to cancelled status
        }

        // For rejected orders, show direct path from pending to rejected
        if (normalizedStatus === 'rejected' || normalizedStatus === 'reject') {
            return 1; // Show progress to rejected status
        }

        // For RTO orders, show path from pending to delivered to RTO
        if (normalizedStatus === 'rto') {
            return 4; // Show progress to RTO status (beyond delivered)
        }

        // Explicit status mapping for better reliability
        switch (normalizedStatus) {
            case 'pending':
                return 0; // Show only pending status
            case 'confirm':
            case 'confirmed':
                return 1;
            case 'ongoing':
            case 'out_for_delivery':
            case 'outfordelivery':
            case 'out for delivery':
                return 2;
            case 'delivered':
                return 3;
            default:
                return 0; // Default to pending
        }
    };

    const statusIndex = getStatusIndex(order.status);

    // Updated status steps to include cancelled and RTO status
    const statusSteps = order.status === 'cancelled'
        ? [
            { name: 'Payment in Pending', icon: Clock, color: 'bg-amber-500' },
            { name: 'Cancelled', icon: XCircle, color: 'bg-red-500' }
        ]
        : order.status === 'reject' || order.status === 'rejected'
            ? [
                { name: 'Payment in Pending', icon: Clock, color: 'bg-amber-500' },
                { name: 'Rejected', icon: XCircle, color: 'bg-red-500' }
            ]

            : order.status === 'rto'
                ? [
                    { name: 'Payment in Pending', icon: Clock, color: 'bg-amber-500' },
                    { name: 'Payment Confirmed', icon: Check, color: 'bg-blue-500' },
                    { name: 'On the Way', icon: Truck, color: 'bg-indigo-500' },
                    { name: 'Delivered', icon: Check, color: 'bg-green-500' },
                    { name: 'RTO', icon: XCircle, color: 'bg-orange-500' }
                ]
                : [
                    { name: 'Payment in Pending', icon: Clock, color: 'bg-amber-500' },
                    { name: 'Payment Confirmed', icon: Check, color: 'bg-blue-500' },
                    { name: 'On the Way', icon: Truck, color: 'bg-indigo-500' },
                    { name: 'Delivered', icon: Check, color: 'bg-green-500' }
                ];

    const shouldShowCancelButton = (order: Order) => {
        // Don't show cancel button if more than 24 hours have passed since order creation
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const hoursDifference = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

        if (hoursDifference > 24) {
            return false;
        }

        // Don't show cancel button for delivered, cancelled, rejected, or RTO orders
        const statusLower = order.status?.toLowerCase();
        if (statusLower === 'delivered' || statusLower === 'cancelled' ||
            statusLower === 'rejected' || statusLower === 'reject' ||
            statusLower === 'rto') {
            return false;
        }

        // Show cancel button for all other orders within 24 hours
        return true;
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Order Details</h1>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white hover:text-amber-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Orders</span>
                    </button>
                </div>

                {/* Progress Tracker - Desktop Only (Horizontal) */}
                <div className="hidden md:block bg-black rounded-xl shadow-md p-6 mb-8">
                    <div className="flex justify-between relative">
                        {/* Progress line */}
                        <div className="absolute top-5 left-[60px] right-[25px] h-1 bg-gray-200 -z-0">

                            <div
                                className="h-full bg-emerald-500 transition-all duration-500 ease-in-out"
                                style={{ width: `${statusIndex === 0 ? 0 : Math.min((statusIndex / (statusSteps.length - 1)) * 100, 100)}%` }}
                            />
                        </div>

                        {statusSteps.map((step, index) => {
                            const isCompleted = index <= statusIndex;
                            const isActive = index === statusIndex;
                            const Icon = step.icon;

                            return (
                                <div key={index} className="flex flex-col items-center relative z-10">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? step.color : 'bg-gray-300'} ${isActive ? 'ring-4 ring-offset-2 ring-emerald-100' : ''}`}
                                    >
                                        <Icon className="text-black" size={16} />
                                    </div>
                                    <span className={`text-xs font-medium mt-2 text-center px-2 ${isCompleted ? 'text-white' : 'text-gray-500'} ${isActive ? 'font-bold' : ''}`}>
                                        {step.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-black rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Order #{String(order.order_id ?? (order as any)._id ?? '').slice(0, 8)}</h2>
                                <span className={`px-4 py-2 rounded-lg font-semibold ${order.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : order.status === 'delivered'
                                        ? 'bg-green-100 text-green-700'
                                        : order.status === 'confirm' || order.status === 'confirmed'
                                            ? 'bg-blue-100 text-blue-700'
                                            : order.status === 'reject' || order.status === 'rejected'
                                                ? 'bg-red-100 text-red-700'

                                                : order.status === 'rto'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : order.status === 'out_for_delivery' || order.status === 'out for delivery' || order.status === 'ongoing'
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {order.status ? getDisplayStatus(order.status) : 'Pending in Confirmation'}
                                </span>
                            </div>

                            {order.items && order.items.length > 0 ? (
                                order.items.map((item) => (
                                    <div key={item.order_item_id || `${item.product_id}-${item.price}-${item.quantity}`} className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-gray-100 last:mb-0 last:pb-0 last:border-0">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={item.Product ? getProductImage(item.Product) : (item as any).product ? getProductImage((item as any).product) : ''}
                                            alt={item.Product?.name || (item as any).product?.name || 'Product'}
                                            className="w-32 h-32 object-cover rounded-lg cursor-pointer bg-gray-100"
                                            onClick={() => {
                                                const pid = item.Product?.product_id || (item as any).product?.product_id;
                                                if (pid) go(`/product/${pid}`);
                                            }}
                                        />
                                    </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                {item.Product?.name || (item as any).product?.name || 'Product'}
                                            </h3>

                                                {(item.Product?.description || (item as any).product?.description) && (
                                                    <p className="text-white mb-4">{item.Product?.description || (item as any).product?.description}</p>
                                                )}

                                            <div className="space-y-2">
                                                <p className="flex justify-between">
                                                    <span className="text-white">Price:</span>
                                                <span className="font-medium">{currencySymbol}{getProductPrice(item.Product || (item as any).product).toFixed(2)}</span>
                                                </p>
                                                <p className="flex justify-between">
                                                    <span className="text-white">Quantity:</span>
                                                    <span className="font-medium">{item.quantity}</span>
                                                </p>
                                                <div className="border-t border-white pt-2 mt-2">
                                                    <p className="flex justify-between text-lg font-bold">
                                                        <span>Total:</span>
                                                        <span className="text-amber-700">{currencySymbol}{(getProductPrice(item.Product || (item as any).product) * item.quantity).toFixed(2)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : order.Product ? (
                                <div className="flex flex-col sm:flex-row gap-6">
                                    {order.Product && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={getProductImage(order.Product)}
                                                alt={order.Product.name}
                                                className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                                                onClick={() => go(`/product/${order.Product?.product_id}`)}
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            {order.Product?.name || 'Product'}
                                        </h3>

                                        {order.Product?.description && (
                                            <p className="text-white mb-4">{order.Product.description}</p>
                                        )}

                                        <div className="space-y-2">
                                            <p className="flex justify-between text-white">
                                                <span className="text-white">Price:</span>
                                                <span className="font-medium text-red">{currencySymbol}{getProductPrice(order.Product).toFixed(2)}</span>
                                            </p>
                                            <p className="flex justify-between text-white">
                                                <span className="text-white">Quantity:</span>
                                                <span className="font-medium text-red">1</span>
                                            </p>
                                            <div className="border-t border-gray-200 pt-2 mt-2">
                                                <p className="flex justify-between text-lg font-bold text-white ">
                                                    <span className='text-white'>Total:</span>
                                                    <span className="text-amber-700">{currencySymbol}{totalPrice.toFixed(2)}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Cancel Order Section - Only show if order can be cancelled and user expands dropdown */}
                            {shouldShowCancelButton(order) && (
                                <div className="mt-6 pt-6 border-gray-200 space-y-3">
                                    <button
                                        onClick={() => setShowCancelSection((v) => !v)}
                                        className="w-full flex items-center justify-between bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 hover:border-amber-700 transition-colors"
                                    >
                                        <span className="font-semibold">Support & Cancellation</span>
                                        <span className="text-sm">{showCancelSection ? '?' : '?'}</span>
                                    </button>

                                    {showCancelSection && (
                                        <div className="bg-black border border-gray-300 rounded-lg p-4">
                                            {cancelError && (
                                                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                                    {cancelError}
                                                </div>
                                            )}
                                            <h3 className="text-lg font-semibold text-white mb-2">Cancel and Return Refund</h3>
                                            <p className="text-gray-400 text-sm mb-4">
                                                For refund contact the support on WhatsApp
                                            </p>
                                            <button
                                                onClick={handleCancelConfirmation}
                                                disabled={isCancelling}
                                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isCancelling
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Order Information Section - Added at the bottom of order summary */}
                        <div className="bg-black rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-gray-100">Order Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Order ID</p>
                                    <p className="font-medium text-white">#{order.order_id}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Order Date & Time</p>
                                    <p className="font-medium text-white">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                {/* <div>
                                    <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                                    <p className="font-medium">Paid via Payoneer</p>
                                    {order.payu_transaction_id && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Transaction ID: {order.payu_transaction_id}
                                        </p>
                                    )}
                                </div> */}
                            </div>
                        </div>

                        {/* Progress Tracker - Mobile Only (Vertical at bottom) */}
                        <div className="md:hidden bg-black rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Order Progress</h3>
                            <div className="flex flex-col items-start relative">
                                {/* Vertical line */}
                                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200 -z-0">
                                    {/* Progress line */}
                                    <div
                                        className="w-full bg-emerald-500 transition-all duration-500 ease-in-out"
                                        style={{
                                            height: `${statusIndex === 0 ? 0 : Math.min((statusIndex / (statusSteps.length - 1)) * 100, 100)}%`
                                        }}
                                    />
                                </div>

                                {statusSteps.map((step, index) => {
                                    const isCompleted = index <= statusIndex;
                                    const isActive = index === statusIndex;
                                    const Icon = step.icon;

                                    return (
                                        <div key={index} className="flex items-center mb-6 last:mb-0 w-full relative z-10">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${isCompleted ? step.color : 'bg-gray-300'} ${isActive ? 'ring-4 ring-offset-2 ring-emerald-100' : ''}`}
                                            >
                                                <Icon className="text-white" size={16} />
                                            </div>
                                            <div className="flex-1 flex items-center">
                                                {isActive && (
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                                )}
                                                <span className={`text-sm font-medium ${isCompleted ? 'text-white' : 'text-white'} ${isActive ? 'font-bold' : ''}`}>
                                                    {step.name}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Order Information */}
                    <div className="space-y-6">
                        <div className="bg-black rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-gray-100">Customer Details</h2>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                                    <p className="font-medium text-white">{typeof fullName !== 'undefined' ? fullName : '--'}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Contact Info</p>
                                    <p className="text-white">{typeof phone1 !== 'undefined' && phone1 !== null ? phone1 : '--'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-gray-100">Delivery Address</h2>

                            <div className="space-y-2">
                                <p className="font-medium">{fullName}</p>
                                <p className="text-gray-600">
                                    {[addressLine, city, state, country].filter(Boolean).join(', ')} {pin}
                                </p>
                                <p className="text-gray-600"> <b>Address Type:</b> {addressType || '--'}</p>
                                <p className="text-gray-600">Phone: {typeof phone1 !== 'undefined' && phone1 !== null ? phone1 : '--'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Dialog */}
            {showCancelDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Cancellation</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to cancel this order?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeCancelDialog}
                                className="px-4 py-2 rounded-lg font-medium text-sm bg-amber-700 text-white hover:bg-amber-800 transition-colors"
                            >
                                No
                            </button>
                            <button
                                onClick={confirmCancelOrder}
                                disabled={isCancelling}
                                className={
                                    isCancelling
                                        ? 'px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'px-4 py-2 rounded-lg font-medium text-sm bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }
                            >
                                {isCancelling ? 'Cancelling...' : 'Yes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
