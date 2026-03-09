import { ArrowLeft, LogOut } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';

interface AdminPageHeaderProps {
    onBack?: () => void;
}

export default function AdminPageHeader({ onBack }: AdminPageHeaderProps) {
    const { logout } = useAdminAuth();

    const handleLogout = () => {
        logout();
        // Redirect to home after logout
        window.location.hash = '';
    };

    return (
        <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-gray-600 mt-1">Manage products, categories, and orders</p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Back to Store
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

