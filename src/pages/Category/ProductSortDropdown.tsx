import { ChevronDown } from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'price-high' | 'price-low';

interface ProductSortDropdownProps {
    sortBy: SortOption;
    showDropdown: boolean;
    onSortChange: (sort: SortOption) => void;
    onToggleDropdown: () => void;
}

export default function ProductSortDropdown({ sortBy, showDropdown, onSortChange, onToggleDropdown }: ProductSortDropdownProps) {
    const getSortLabel = () => {
        switch (sortBy) {
            case 'newest':
                return 'Newest First';
            case 'oldest':
                return 'Oldest First';
            case 'price-high':
                return 'Price: High to Low';
            case 'price-low':
                return 'Price: Low to High';
            default:
                return 'Sort';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={onToggleDropdown}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-amber-700 transition-colors text-sm"
            >
                <span>{getSortLabel()}</span>
                <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showDropdown && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]">
                    <button
                        onClick={() => {
                            onSortChange('newest');
                            onToggleDropdown();
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-amber-50 transition-colors text-sm ${sortBy === 'newest' ? 'bg-amber-50 text-amber-700' : ''}`}
                    >
                        Newest First
                    </button>
                    <button
                        onClick={() => {
                            onSortChange('oldest');
                            onToggleDropdown();
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-amber-50 transition-colors text-sm ${sortBy === 'oldest' ? 'bg-amber-50 text-amber-700' : ''}`}
                    >
                        Oldest First
                    </button>
                    <button
                        onClick={() => {
                            onSortChange('price-high');
                            onToggleDropdown();
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-amber-50 transition-colors text-sm ${sortBy === 'price-high' ? 'bg-amber-50 text-amber-700' : ''}`}
                    >
                        Price: High to Low
                    </button>
                    <button
                        onClick={() => {
                            onSortChange('price-low');
                            onToggleDropdown();
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-amber-50 transition-colors text-sm ${sortBy === 'price-low' ? 'bg-amber-50 text-amber-700' : ''}`}
                    >
                        Price: Low to High
                    </button>
                </div>
            )}
        </div>
    );
}

