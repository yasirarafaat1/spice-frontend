interface Category {
    id: number;
    name: string;
}

interface CategorySelectorProps {
    categories: Category[];
    selectedCategory: string | null;
    onCategorySelect: (categoryName: string) => void;
}

export default function CategorySelector({ categories, selectedCategory, onCategorySelect }: CategorySelectorProps) {
    return (
        <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Category</h2>
            <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => onCategorySelect(category.name)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            selectedCategory === category.name
                                ? 'bg-amber-700 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-700 border border-gray-200'
                        }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

