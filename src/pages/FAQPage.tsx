import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FAQPageProps {
    onBack: () => void;
}

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

export default function FAQPage({ onBack }: FAQPageProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs: FAQItem[] = [
        {
            category: 'Orders & Payment',
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit/debit cards, UPI, net banking, and Cash on Delivery (COD) for orders within India.'
        },
        {
            category: 'Orders & Payment',
            question: 'How can I track my order?',
            answer: 'Once your order is shipped, you will receive a tracking number via email. You can also track your order from the "My Orders" section in your account.'
        },
        {
            category: 'Orders & Payment',
            question: 'Can I modify or cancel my order?',
            answer: 'Orders cannot be modified but cancelled within 24 hours of placement. After that, please contact our customer service for assistance.'
        },
        {
            category: 'Shipping',
            question: 'How long does delivery take?',
            answer: 'Standard delivery takes 7-8 business days.'
        },
        {
            category: 'Shipping',
            question: 'Do you ship internationally?',
            answer: 'Yes, we ship all over the world. International shipping will be available.'
        },
        {
            category: 'Shipping',
            question: 'What are the shipping charges?',
            answer: 'Free Shipping'
        },
        {
            category: 'Returns & Exchanges',
            question: 'What is your return policy?',
            answer: 'We accept returns within 30 days of delivery. Items must be unused, in original packaging with tags intact. Please contact us to initiate a return.'
        },
        {
            category: 'Returns & Exchanges',
            question: 'How do I return an item?',
            answer: 'Contact our customer service at abdullahislamicstore88@gmail.com or call +917652087193. We will provide you with return authorization and instructions.'
        },
        {
            category: 'Returns & Exchanges',
            question: 'When will I receive my refund?',
            answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method.'
        },
        {
            category: 'Products',
            question: 'Are your products authentic?',
            answer: 'Yes, all our Islamic art and decor products are authentic and sourced from trusted suppliers. We ensure high quality and craftsmanship.'
        },
        {
            category: 'Products',
            question: 'Can I customize a product?',
            answer: 'Currently, we don\'t offer customization services. However, we plan to introduce this feature soon. Stay tuned to our website and social media for updates.'
        },
        {
            category: 'Products',
            question: 'How do I care for my Islamic art products?',
            answer: 'Most items can be cleaned with a soft, dry cloth. Avoid using harsh chemicals or water. Specific care instructions are included with each product.'
        },
        {
            category: 'Account',
            question: 'Do I need an account to place an order?',
            answer: 'Yes, you cannot checkout as a guest. However, creating an account helps you track orders easily and enjoy a faster checkout experience.'
        },
    ];

    const categories = Array.from(new Set(faqs.map(faq => faq.category)));

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
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
                <p className="text-gray-600 mb-8">
                    Find answers to common questions about our products, orders, shipping, and more.
                </p>

                <div className="space-y-8">
                    {categories.map((category) => (
                        <div key={category}>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-amber-500">
                                {category}
                            </h2>
                            <div className="space-y-3">
                                {faqs
                                    .filter((faq) => faq.category === category)
                                    .map((faq) => {
                                        const globalIndex = faqs.findIndex(
                                            (f) => f.question === faq.question
                                        );
                                        const isOpen = openIndex === globalIndex;

                                        return (
                                            <div
                                                key={globalIndex}
                                                className="bg-white rounded-lg shadow-sm overflow-hidden"
                                            >
                                                <button
                                                    onClick={() =>
                                                        setOpenIndex(isOpen ? null : globalIndex)
                                                    }
                                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                >
                                                    <span className="font-medium text-gray-900 pr-4">
                                                        {faq.question}
                                                    </span>
                                                    <ChevronDown
                                                        className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'transform rotate-180' : ''
                                                            }`}
                                                    />
                                                </button>
                                                {isOpen && (
                                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                                        <p className="text-gray-600">{faq.answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6 text-center">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        Still have questions?
                    </h3>
                    <p className="text-gray-700 mb-4">
                        Can't find the answer you're looking for? Our customer service team
                        is here to help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm">
                        <a
                            href="mailto:abdullahislamicstore88@gmail.com"
                            className="text-amber-700 hover:text-amber-800 font-medium"
                        >
                            📧 abdullahislamicstore88@gmail.com
                        </a>
                        <span className="hidden sm:inline text-gray-400">|</span>
                        <span className="text-gray-700">📞 +91 76520 87193</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
