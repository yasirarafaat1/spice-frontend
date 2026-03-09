import { X } from 'lucide-react';
import { Order, getImageUrl, getStatusColor, getStatusIcon, getDisplayStatus } from './OrderStatusUtils';
import OrderStatusButtons from './OrderStatusButtons';

interface OrderDetailsModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    updatingOrderId: string | null;
    onStatusUpdate: (orderId: string, newStatus: string) => void;
}

export default function OrderDetailsModal({
    order,
    isOpen,
    onClose,
    updatingOrderId,
    onStatusUpdate
}: OrderDetailsModalProps) {
    if (!isOpen || !order) return null;

    const addrObj = (order as any).address && typeof (order as any).address === 'object' ? (order as any).address : null;
    const fullName = order.FullName || addrObj?.FullName || addrObj?.full_name || '--';
    const phone1 = order.phone1 || addrObj?.phone1 || addrObj?.phone || '--';
    const phone2 = order.phone2 || addrObj?.phone2 || addrObj?.alt_phone || '';
    const addressLine = typeof order.address === 'string'
        ? order.address
        : [addrObj?.address, addrObj?.address_line1].filter(Boolean).join(', ');
    const city = order.city || addrObj?.city || '';
    const state = order.state || addrObj?.state || '';
    const country = order.country || addrObj?.country || '';
    const pin = order.pinCode || addrObj?.pinCode || addrObj?.postal_code || '';

    // Get product image from items or Product
    const productFromItem = order.items && order.items.length > 0 ? (order.items[0].Product || order.items[0].product) : null;
    const productImage = productFromItem
        ? getImageUrl(productFromItem.product_image)
        : (order.Product ? getImageUrl(order.Product.product_image) : '');

    // Get product name from items or Product
    const productName = productFromItem
        ? (productFromItem.name || productFromItem.title)
        : (order.Product ? (order.Product.name || order.Product.title) : 'N/A');

    // Get product price from items or Product
    const productPrice = productFromItem
        ? (productFromItem.selling_price ?? productFromItem.price ?? 0)
        : (order.Product ? (order.Product.selling_price ?? order.Product.price ?? 0) : 0);

    // Get original price from items or Product
    const originalPrice = productFromItem
        ? (productFromItem.price ?? 0)
        : (order.Product ? order.Product.price ?? 0 : 0);

    const addrType = order.addressType || addrObj?.addressType || '--';
    const currencySymbol = (order as any).currency === 'INR' || !(order as any).currency ? '₹' : '$';

    // Subtotal/total fallback calculation to avoid NaN
    const computedSubtotal = (() => {
        if (order.totalAmount !== undefined && order.totalAmount !== null && !isNaN(Number(order.totalAmount))) {
            return Number(order.totalAmount);
        }
        if ((order as any).amount !== undefined && (order as any).amount !== null && !isNaN(Number((order as any).amount))) {
            return Number((order as any).amount) / 100; // Razorpay stores paise
        }
        if (order.items && order.items.length > 0) {
            return order.items.reduce((sum, item) => {
                const qty = Number((item as any).quantity ?? 1);
                const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
                const price = item.Product || (item as any).product ? (item.Product ? (item.Product.selling_price ?? item.Product.price ?? 0) : ((item as any).product?.selling_price ?? (item as any).product?.price ?? 0)) : productPrice;
                return sum + price * safeQty;
            }, 0);
        }
        const singleQty = Number(order.quantity ?? 1);
        const safeSingleQty = Number.isFinite(singleQty) && singleQty > 0 ? singleQty : 1;
        return productPrice * safeSingleQty;
    })();
    const subtotalDisplay = Number.isFinite(computedSubtotal) ? computedSubtotal : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order ID:</span>
                                    <span className="font-medium">#{String(order.order_id ?? order._id ?? '').slice(0, 8)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order Date:</span>
                                    <span className="font-medium">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {getDisplayStatus(order.status)}
                                    </span>
                                </div>
                                {/* {order.payment_method && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span className="font-medium">{order.payment_method}</span>
                                    </div>
                                )} */}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Full Name:</span>
                                    <span className="font-medium">{fullName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phone 1:</span>
                                    <span className="font-medium">{phone1}</span>
                                </div>
                                {phone2 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone 2:</span>
                                        <span className="font-medium">{phone2}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Address:</span>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {[addressLine, city, state, country].filter(Boolean).join(', ')} {pin && `- ${pin}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Address Type:</span>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {addrType}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                {productImage && (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={productImage}
                                            alt={productName || 'Product'}
                                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96?text=No+Image';
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{productName}</h4>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm">
                                            <span className="text-gray-600">Price:</span>{' '}
                                            <span className="font-medium text-gray-900">{currencySymbol}{productPrice}</span>
                                            {originalPrice > productPrice && (
                                                <span className="text-gray-500 line-through ml-2">{currencySymbol}{originalPrice}</span>
                                            )}
                                        </p>
                                        <p className="text-sm">
                                            <span className="text-gray-600">Quantity:</span>{' '}
                                            <span className="font-medium">
                                                {order.items && order.items.length > 0 ? order.items[0].quantity : 1}
                                            </span>
                                        </p>
                                        <p className="text-sm">
                                            <span className="text-gray-600">Total:</span>{' '}
                                            <span className="font-medium text-amber-700">
                                                {currencySymbol}{(productPrice * (order.items && order.items.length > 0 ? Number(order.items[0].quantity ?? 1) || 1 : 1)).toFixed(2)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">{currencySymbol}{subtotalDisplay.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                                <span>Total:</span>
                                <span className="text-amber-700">{currencySymbol}{subtotalDisplay.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Update Buttons - Show for all orders */}
                    <OrderStatusButtons
                        order={order}
                        updatingOrderId={updatingOrderId}
                        onStatusUpdate={onStatusUpdate}
                    />
                </div>
            </div>
        </div>
    );
}
