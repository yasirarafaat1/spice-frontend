import { CheckCircle, XCircle, Truck, Clock, RefreshCw } from 'lucide-react';
import { Order } from './OrderStatusUtils';

interface OrderStatusButtonsProps {
    order: Order;
    updatingOrderId: string | null;
    onStatusUpdate: (orderId: string, newStatus: string) => void;
}

export default function OrderStatusButtons({ order, updatingOrderId, onStatusUpdate }: OrderStatusButtonsProps) {
    const getButtonDisabledState = (buttonStatus: string): boolean => {
        const currentStatus = order.status.toLowerCase();
        const buttonStatusLower = buttonStatus.toLowerCase();
        const isUpdating = updatingOrderId === order.order_id;

        if (isUpdating) return true;

        // If order is delivered, only allow RTO
        if (currentStatus === 'delivered') {
            return buttonStatusLower !== 'rto';
        }

        // If order is RTO, reject, or cancelled, disable all buttons
        if (currentStatus === 'rto' || currentStatus === 'reject' || currentStatus === 'rejected' || currentStatus === 'cancelled') {
            return true;
        }

        if (currentStatus === 'confirm' || currentStatus === 'confirmed') {
            // Only allow ongoing and RTO buttons
            return !(buttonStatusLower === 'ongoing' || buttonStatusLower === 'rto');
        }

        if (currentStatus === 'ongoing') {
            // Only allow delivered and RTO buttons
            return !(buttonStatusLower === 'delivered' || buttonStatusLower === 'rto');
        }

        // For pending orders, only allow confirm and reject buttons
        if (currentStatus === 'pending') {
            return !(buttonStatusLower === 'confirm' || buttonStatusLower === 'reject');
        }

        return false;
    };

    const shouldShowButton = (buttonStatus: string): boolean => {
        const currentStatus = order.status.toLowerCase();
        const buttonStatusLower = buttonStatus.toLowerCase();

        if (currentStatus === buttonStatusLower) {
            return false;
        }

        // If order is delivered, only show RTO button
        if (currentStatus === 'delivered') {
            return buttonStatusLower === 'rto';
        }

        // If order is rejected, don't show any other buttons
        if (currentStatus === 'reject' || currentStatus === 'rejected') {
            return false;
        }

        // If order is confirmed, show only ongoing and RTO buttons
        if (currentStatus === 'confirm' || currentStatus === 'confirmed') {
            return buttonStatusLower === 'ongoing' || buttonStatusLower === 'rto';
        }

        // If order is ongoing, show delivered and RTO buttons
        if (currentStatus === 'ongoing') {
            return buttonStatusLower === 'delivered' || buttonStatusLower === 'rto';
        }

        // For pending orders, show only confirm and reject by default
        if (currentStatus === 'pending') {
            return buttonStatusLower === 'confirm' || buttonStatusLower === 'reject';
        }

        return true;
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Update Status:</p>
            <div className="flex flex-wrap gap-2">
                {shouldShowButton('confirm') && (
                    <button
                        onClick={() => onStatusUpdate(order.order_id, 'confirm')}
                        disabled={getButtonDisabledState('confirm')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        <CheckCircle size={16} />
                        Confirm
                    </button>
                )}
                {shouldShowButton('ongoing') && (
                    <button
                        onClick={() => onStatusUpdate(order.order_id, 'ongoing')}
                        disabled={getButtonDisabledState('ongoing')}
                        className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        <Clock size={16} />
                        Ongoing
                    </button>
                )}
                {shouldShowButton('delivered') && (
                    <button
                        onClick={() => onStatusUpdate(order.order_id, 'delivered')}
                        disabled={getButtonDisabledState('delivered')}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        <Truck size={16} />
                        Delivered
                    </button>
                )}
                {shouldShowButton('rto') && (
                    <button
                        onClick={() => onStatusUpdate(order.order_id, 'rto')}
                        disabled={getButtonDisabledState('rto')}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        <XCircle size={16} />
                        RTO
                    </button>
                )}
                {shouldShowButton('reject') && (
                    <button
                        onClick={() => onStatusUpdate(order.order_id, 'reject')}
                        disabled={getButtonDisabledState('reject')}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        <XCircle size={16} />
                        Reject
                    </button>
                )}

                {updatingOrderId === order.order_id && (
                    <span className="text-sm text-gray-500 flex items-center gap-1.5">
                        <RefreshCw size={14} className="animate-spin" />
                        Updating...
                    </span>
                )}
            </div>
        </div>
    );
}