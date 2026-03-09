import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OrderPaginationProps {
    currentPage: number;
    totalPages: number;
    onPreviousPage: () => void;
    onNextPage: () => void;
}

export default function OrderPagination({ currentPage, totalPages, onPreviousPage, onNextPage }: OrderPaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
                onClick={onPreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                <ChevronLeft size={18} />
                Previous
            </button>
            <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={onNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                Next
                <ChevronRight size={18} />
            </button>
        </div>
    );
}

