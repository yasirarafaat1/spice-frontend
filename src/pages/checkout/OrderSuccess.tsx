import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigation } from "../../utils/navigation";

interface OrderSuccessProps {
    onContinueShopping: () => void;
    clearCartOnSuccess?: boolean; // Optional prop to control cart clearing
}

export default function OrderSuccess({ onContinueShopping, clearCartOnSuccess = false }: OrderSuccessProps) {
    const { clearCart } = useCart();
    const { go } = useNavigation();

    // Clear the cart when the component mounts only if explicitly requested
    useEffect(() => {
        if (clearCartOnSuccess) {
            clearCart();
        }
    }, [clearCartOnSuccess, clearCart]);

    const handleViewOrder = () => {
        go("/orders");
    };

    const handleContinueShopping = () => {
        onContinueShopping();
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-black rounded-2xl shadow-lg p-8 text-center">
                <div className="bg-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Check size={40} className="text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Order Placed Successfully!</h2>
                <p className="text-white mb-8">
                    Thank you for your purchase. Your order has been confirmed and you will receive an email confirmation shortly.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleViewOrder}
                        className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                        View Order Details
                    </button>

                    <button
                        onClick={handleContinueShopping}
                        className="w-full border border-amber-700 text-amber-700 hover:bg-amber-50 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}