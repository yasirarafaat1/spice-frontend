import { useState, useEffect } from 'react';
import { Users, MapPin, ShoppingBag, ChevronRight, Phone, Mail } from 'lucide-react';
import { api } from '../../../services/api';

interface User {
    id: string;
    email: string;
    orders: Order[];
}

interface Order {
  order_id: string;
  totalAmount: string;
  status: string;
  payment_status: string;
  FullName: string;
  phone1: string;
  phone2: string | null;
  state: string;
  city: string;
  pinCode: string;
  address: string;
  addressType: string;
  country?: string;
  createdAt: string;
  items: OrderItem[];
  Product?: {
    name: string;
    title: string;
    price: number;
    selling_price: number;
    product_image: Record<string, string>;
  };
}

interface ApiResponseOrder {
  user?: {
    email?: string;
    id?: string;
  };
  order_id: string;
  totalAmount: string;
  status: string;
  payment_status: string;
  FullName: string;
  phone1: string;
  phone2: string | null;
  state: string;
  city: string;
  pinCode: string;
  address: string;
  addressType: string;
  country?: string;
  createdAt: string;
  items: OrderItem[];
  Product?: {
    name: string;
    title: string;
    price: number;
    selling_price: number;
    product_image: Record<string, string>;
  };
}

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  Product: {
    name: string;
    title?: string;
    price: number;
    selling_price: number;
    product_image: Record<string, string>;
  };
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
    const [expandedAddresses, setExpandedAddresses] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/get-orders');

            if (response.data.status) {
                // Group orders by user email
                const userMap = new Map<string, User>();

                response.data.orders.forEach((order: ApiResponseOrder) => {
                    const email = order.user?.email || 'Unknown User';
                    const userId = order.user?.id || 'unknown';

                    if (!userMap.has(email)) {
                        userMap.set(email, {
                            id: userId,
                            email: email,
                            orders: []
                        });
                    }

                    const user = userMap.get(email)!;
                    user.orders.push({
                        order_id: order.order_id,
                        totalAmount: order.totalAmount,
                        status: order.status,
                        payment_status: order.payment_status,
                        FullName: order.FullName,
                        phone1: order.phone1,
                        phone2: order.phone2,
                        state: order.state,
                        city: order.city,
                        pinCode: order.pinCode,
                        address: order.address,
                        addressType: order.addressType,
                        createdAt: order.createdAt,
                        items: order.items || []
                    });
                });

                // Convert to array and sort by email
                const usersArray = Array.from(userMap.values()).sort((a, b) =>
                    a.email.localeCompare(b.email)
                );

                setUsers(usersArray);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
            setError(errorMessage);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (email: string) => {
        const newExpanded = new Set(expandedUsers);
        if (newExpanded.has(email)) {
            newExpanded.delete(email);
        } else {
            newExpanded.add(email);
        }
        setExpandedUsers(newExpanded);
    };

    const toggleAddress = (addressKey: string) => {
        const newExpanded = new Set(expandedAddresses);
        if (newExpanded.has(addressKey)) {
            newExpanded.delete(addressKey);
        } else {
            newExpanded.add(addressKey);
        }
        setExpandedAddresses(newExpanded);
    };

    const openOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800">Error: {error}</div>
                <button
                    onClick={fetchUsers}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="text-amber-600" size={28} />
                    User Management
                </h2>
                <p className="text-gray-600 mt-1">
                    Manage all users, their addresses, and orders
                </p>
            </div>

            <div className="p-6">
                {users.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No users have placed orders yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {users.map((user) => {
                            const isUserExpanded = expandedUsers.has(user.email);

                            // Group orders by address
                            const addressMap = new Map<string, Order[]>();
                            user.orders.forEach(order => {
                                const addressKey = `${order.FullName}-${order.phone1}-${order.address}`;
                                if (!addressMap.has(addressKey)) {
                                    addressMap.set(addressKey, []);
                                }
                                addressMap.get(addressKey)!.push(order);
                            });

                            return (
                                <div key={user.email} className="border border-gray-200 rounded-lg">
                                    {/* User Header */}
                                    <div
                                        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                        onClick={() => toggleUser(user.email)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-amber-100 p-2 rounded-full">
                                                <Mail className="text-amber-600" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{user.email}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {addressMap.size} address{addressMap.size !== 1 ? 'es' : ''} • {user.orders.length} order{user.orders.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight
                                            className={`transform transition-transform ${isUserExpanded ? 'rotate-90' : ''}`}
                                            size={20}
                                        />
                                    </div>

                                    {/* User Details */}
                                    {isUserExpanded && (
                                        <div className="border-t border-gray-200">
                                            {Array.from(addressMap.entries()).map(([addressKey, orders]) => {
                                                const firstOrder = orders[0];
                                                const isAddressExpanded = expandedAddresses.has(addressKey);

                                                return (
                                                    <div key={addressKey} className="ml-8 border-l-2 border-gray-200">
                                                        {/* Address Header */}
                                                        <div
                                                            className="flex items-start p-4 cursor-pointer hover:bg-gray-50"
                                                            onClick={() => toggleAddress(addressKey)}
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <MapPin className="text-gray-500" size={16} />
                                                                    <h4 className="font-medium text-gray-900">{firstOrder.FullName}</h4>
                                                                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
                                                                        {firstOrder.addressType}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 ml-6">
                                                                    {firstOrder.address}, {firstOrder.city}, {firstOrder.state} - {firstOrder.pinCode}
                                                                </p>
                                                                <div className="flex items-center gap-4 mt-2 ml-6">
                                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                        <Phone size={14} />
                                                                        {firstOrder.phone1}
                                                                        {firstOrder.phone2 && ` / ${firstOrder.phone2}`}
                                                                    </div>
                                                                    <span className="text-sm text-gray-600">
                                                                        {orders.length} order{orders.length !== 1 ? 's' : ''}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <ChevronRight
                                                                className={`transform transition-transform ${isAddressExpanded ? 'rotate-90' : ''}`}
                                                                size={18}
                                                            />
                                                        </div>

                                                        {/* Orders List */}
                                                        {isAddressExpanded && (
                                                            <div className="ml-8 mb-4">
                                                                {orders.length === 0 ? (
                                                                    <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                                                                        No orders found for this address
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-3">
                                                                        {orders.map((order) => (
                                                                            <div key={order.order_id} className="bg-white border rounded-lg p-4">
                                                                                <div className="flex justify-between items-start mb-3">
                                                                                    <div>
                                                                                        <h5 className="font-medium text-gray-900">
                                                                                            Order #{order.order_id.substring(0, 8)}
                                                                                        </h5>
                                                                                        <p className="text-sm text-gray-500">
                                                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className="flex gap-2">
                                                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                                                            {order.status}
                                                                                        </span>
                                                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                                                                            {order.payment_status}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex justify-between items-center">
                                                                                    <div>
                                                                                        <p className="text-lg font-semibold text-gray-900">
                                                                                            ${order.totalAmount}
                                                                                        </p>
                                                                                        <p className="text-sm text-gray-600">
                                                                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1 cursor-pointer text-amber-600">
                                                                                        <ShoppingBag size={16} />
                                                                                        <span className="text-sm font-medium" onClick={() => openOrderDetails(order)}>
                                                                                            View Details
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
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
                                  <span className="font-medium">#{selectedOrder.order_id.slice(0, 8)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Order Date:</span>
                                  <span className="font-medium">
                                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
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
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                    {getDisplayStatus(selectedOrder.status)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Payment Status:</span>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                                    {selectedOrder.payment_status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Full Name:</span>
                                  <span className="font-medium">{selectedOrder.FullName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Phone 1:</span>
                                  <span className="font-medium">{selectedOrder.phone1}</span>
                                </div>
                                {selectedOrder.phone2 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Phone 2:</span>
                                    <span className="font-medium">{selectedOrder.phone2}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Address:</span>
                                  <div className="text-right">
                                    <p className="font-medium">
                                      {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state}, {selectedOrder.country || 'India'} - {selectedOrder.pinCode}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Address Type:</span>
                                  <div className="text-right">
                                    <p className="font-medium capitalize">{selectedOrder.addressType}</p>
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
                                {/* Product image logic */}
                                {(() => {
                                  let img = '';
                                  if (selectedOrder.items && selectedOrder.items.length > 0) {
                                    const firstImage = Object.values(selectedOrder.items[0].Product.product_image)[0];
                                    if (typeof firstImage === 'string') img = firstImage;
                                  } else if (selectedOrder.Product) {
                                    const firstImage = Object.values(selectedOrder.Product.product_image)[0];
                                    if (typeof firstImage === 'string') img = firstImage;
                                  }
                                  
                                  return img ? (
                                    <div className="flex-shrink-0">
                                      <img
                                        src={img}
                                        alt="Product"
                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96?text=No+Image';
                                        }}
                                      />
                                    </div>
                                  ) : null;
                                })()}
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">
                                    {selectedOrder.items && selectedOrder.items.length > 0
                                      ? (selectedOrder.items[0].Product.name || 'Unknown Product')
                                      : (selectedOrder.Product ? (selectedOrder.Product.name || selectedOrder.Product.title || 'Unknown Product') : 'N/A')}
                                  </h4>
                                  <div className="mt-2 space-y-1">
                                    <p className="text-sm">
                                      <span className="text-gray-600">Price:</span>{' '}
                                      <span className="font-medium text-gray-900">
                                        ${selectedOrder.items && selectedOrder.items.length > 0
                                          ? selectedOrder.items[0].Product.selling_price
                                          : (selectedOrder.Product ? selectedOrder.Product.selling_price : 0)}
                                      </span>
                                    </p>
                                    <p className="text-sm">
                                      <span className="text-gray-600">Quantity:</span>{' '}
                                      <span className="font-medium">
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items[0].quantity : 1}
                                      </span>
                                    </p>
                                    <p className="text-sm">
                                      <span className="text-gray-600">Total:</span>{' '}
                                      <span className="font-medium text-amber-700">
                                        ${(() => {
                                          const price = selectedOrder.items && selectedOrder.items.length > 0
                                            ? selectedOrder.items[0].Product.selling_price
                                            : (selectedOrder.Product ? selectedOrder.Product.selling_price : 0);
                                          const qty = selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items[0].quantity : 1;
                                          return (price * qty).toFixed(2);
                                        })()}
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
                                <span className="font-medium">${parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                              </div>
                              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                                <span>Total:</span>
                                <span className="text-amber-700">${parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper functions
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirm': return 'bg-green-100 text-green-800';
    case 'shipped': return 'bg-blue-100 text-blue-800';
    case 'delivered': return 'bg-purple-100 text-purple-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getDisplayStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'confirm': 'Confirmed',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return statusMap[status.toLowerCase()] || status;
};
