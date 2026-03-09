import { ArrowLeft, Truck, Package, MapPin, Clock } from 'lucide-react';

interface ShippingInfoPageProps {
    onBack: () => void;
}

export default function ShippingInfoPage({ onBack }: ShippingInfoPageProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-600 hover:text-amber-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Home
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Information</h1>

                <div className="space-y-6">
                    {/* Shipping Methods */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Truck className="w-6 h-6 text-amber-600" />
                            <h2 className="text-xl font-semibold">Shipping Methods</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="border-l-4 border-amber-500 pl-4">
                                <h3 className="font-medium text-gray-900">Standard Delivery</h3>
                                <p className="text-gray-600">5-7 business days</p>
                                <p className="text-sm text-gray-500">Available for all pin codes across world</p>
                            </div>
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h3 className="font-medium text-gray-900">Express Delivery</h3>
                                <p className="text-gray-600">2-3 business days</p>
                                <p className="text-sm text-gray-500">Available in major cities</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Areas */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="w-6 h-6 text-amber-600" />
                            <h2 className="text-xl font-semibold">Delivery Areas</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            We currently deliver to all over world. Enter your pin code at checkout to verify delivery availability in your area.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> Delivery to remote areas may take additional 2-3 business days.
                            </p>
                        </div>
                    </div>

                    {/* Processing Time */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-6 h-6 text-amber-600" />
                            <h2 className="text-xl font-semibold">Order Processing Time</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Orders are processed within 1-2 business days. Orders placed on weekends or holidays will be processed on the next business day.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600">
                            <li>You will receive an order confirmation email immediately after placing your order</li>
                            <li>A shipping confirmation with tracking details will be sent once your order is dispatched</li>
                            <li>Track your order anytime from your account dashboard</li>
                        </ul>
                    </div>

                    {/* Packaging */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Package className="w-6 h-6 text-amber-600" />
                            <h2 className="text-xl font-semibold">Packaging</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            All products are carefully packaged to ensure they reach you in perfect condition. We use eco-friendly packaging materials whenever possible.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800">
                                <strong>Gift Wrapping:</strong> Complimentary gift wrapping available for all orders. Select this option at checkout.
                            </p>
                        </div>
                    </div>

                    {/* International Shipping */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">International Shipping</h2>
                        <p className="text-gray-600">
                            Yes, we ship globally. International shipping is available.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                        <p className="text-gray-700 mb-3">
                            If you have any questions about shipping, please contact our customer service team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 text-sm">
                            <span className="text-gray-600">📧 abdullahislamicstore88@gmail.com</span>
                            <span className="text-gray-600">📞 +917652087193</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
