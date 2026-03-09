import { ArrowLeft, RotateCcw, Package, CheckCircle, XCircle } from 'lucide-react';

interface ReturnsPageProps {
    onBack: () => void;
}

export default function ReturnsPage({ onBack }: ReturnsPageProps) {
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
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Returns & Exchanges</h1>

                <div className="space-y-6">
                    {/* Return Policy */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <RotateCcw className="w-6 h-6 text-amber-600" />
                            <h2 className="text-xl font-semibold">Return Policy</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            We want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within <strong> 30 days</strong> of delivery for a full refund or exchange.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-sm text-amber-800 font-medium">
                                Items must be unused, in original packaging, and in resalable condition.
                            </p>
                        </div>
                    </div>

                    {/* Eligible Items */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-semibold">Eligible for Return</h2>
                        </div>
                        <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>Products in original packaging with tags intact</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>Damaged or defective items (photo evidence required)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>Wrong item delivered</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>Products not matching description</span>
                            </li>
                        </ul>
                    </div>

                    {/* Non-Eligible Items */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <XCircle className="w-6 h-6 text-red-600" />
                            <h2 className="text-xl font-semibold">Not Eligible for Return</h2>
                        </div>
                        <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-red-600 mt-1">✗</span>
                                <span>Products without original packaging or tags</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-600 mt-1">✗</span>
                                <span>Used or installed items</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-600 mt-1">✗</span>
                                <span>Customized or personalized products</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-600 mt-1">✗</span>
                                <span>Returns requested after 30 days of delivery</span>
                            </li>
                        </ul>
                    </div>

                    {/* Return Process */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Package className="w-6 h-6 text-amber-600" />
                            <h2 className="text-xl font-semibold">How to Return</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-semibold">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Contact Us</h3>
                                    <p className="text-gray-600 text-sm">
                                        Email us at <b>abdullahislamicstore88@gmail.com</b> or call <b>+917652087193</b> with your order number and reason for return.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-semibold">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Get Approval</h3>
                                    <p className="text-gray-600 text-sm">
                                        Our team will review your request and provide return authorization within 24 hours.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-semibold">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Ship the Item</h3>
                                    <p className="text-gray-600 text-sm">
                                        Pack the item securely in its original packaging and ship it to the address provided. We'll arrange pickup for defective items.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-semibold">
                                    4
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Get Refund/Exchange</h3>
                                    <p className="text-gray-600 text-sm">
                                        Once we receive and inspect the item, your refund will be processed within 5-7 business days or exchange will be shipped immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Refund Information */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Refund Information</h2>
                        <ul className="space-y-2 text-gray-600">
                            <li>• Refunds will be credited to the original payment method</li>
                            <li>• Processing time: 5-7 business days after item is received</li>
                            <li>• Shipping charges are non-refundable (except for defective/wrong items)</li>
                            <li>• Return shipping costs are customer's responsibility unless item is defective</li>
                        </ul>
                    </div>

                    {/* Exchange Policy */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Exchange Policy</h2>
                        <p className="text-gray-600 mb-3">
                            Want to exchange for a different product or size? We're happy to help!
                        </p>
                        <ul className="space-y-2 text-gray-600">
                            <li>• Same process as returns - contact us first</li>
                            <li>• Exchanges are subject to product availability</li>
                            <li>• Price differences will be adjusted accordingly</li>
                            <li>• Free exchange for defective or wrong items</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Questions About Returns?</h3>
                        <p className="text-gray-700 mb-3">
                            Our customer service team is here to help make your return process smooth and hassle-free.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 text-sm">
                            <a href="mailto:info@abdullaislamicstore.com" className="text-blue-600 hover:text-blue-700">
                                📧 abdullahislamicstore88@gmail.com
                            </a>
                            <span className="text-gray-600">📞 +917652087193</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
