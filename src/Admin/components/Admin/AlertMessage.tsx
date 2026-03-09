import { AlertCircle, X } from 'lucide-react';

interface AlertMessageProps {
    type: 'error' | 'success' | 'warning';
    message: string;
    onClose?: () => void;
}

export default function AlertMessage({ type, message, onClose }: AlertMessageProps) {
    const styles = {
        error: {
            container: 'bg-red-50 border-red-200',
            icon: 'text-red-600',
            title: 'text-red-800',
            text: 'text-red-700',
            close: 'text-red-600 hover:text-red-800',
        },
        success: {
            container: 'bg-green-50 border-green-200',
            icon: 'text-green-600',
            title: 'text-green-800',
            text: 'text-green-700',
            close: 'text-green-600 hover:text-green-800',
        },
        warning: {
            container: 'bg-yellow-50 border-yellow-200',
            icon: 'text-yellow-600',
            title: 'text-yellow-800',
            text: 'text-yellow-700',
            close: 'text-yellow-600 hover:text-yellow-800',
        },
    };

    const style = styles[type];

    return (
        <div className={`mb-4 p-4 border rounded-lg flex items-start gap-3 ${style.container}`}>
            <AlertCircle className={`${style.icon} flex-shrink-0 mt-0.5`} size={20} />
            <div className="flex-1">
                <p className={`${style.title} font-medium`}>
                    {type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Note'}
                </p>
                <p className={`${style.text} text-sm`}>{message}</p>
            </div>
            {onClose && (
                <button onClick={onClose} className={style.close}>
                    <X size={18} />
                </button>
            )}
        </div>
    );
}

