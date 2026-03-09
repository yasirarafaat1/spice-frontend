import { Package, ShoppingBag, List, Users } from 'lucide-react';

interface AdminTabsProps {
    activeTab: 'upload' | 'products' | 'orders' | 'users';
    onTabChange: (tab: 'upload' | 'products' | 'orders' | 'users') => void;
}

export default function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
    return (
        <div className="flex gap-2 border-b border-gray-200">
            <button
                onClick={() => onTabChange('upload')}
                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'upload'
                        ? 'text-amber-700 border-b-2 border-amber-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <Package size={20} />
                    Upload Product
                </div>
            </button>
            <button
                onClick={() => onTabChange('products')}
                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'products'
                        ? 'text-amber-700 border-b-2 border-amber-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <List size={20} />
                    Products List
                </div>
            </button>
            <button
                onClick={() => onTabChange('orders')}
                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'orders'
                        ? 'text-amber-700 border-b-2 border-amber-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <ShoppingBag size={20} />
                    Orders
                </div>
            </button>
            <button
                onClick={() => onTabChange('users')}
                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'users'
                        ? 'text-amber-700 border-b-2 border-amber-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <Users size={20} />
                    Users
                </div>
            </button>
        </div>
    );
}

