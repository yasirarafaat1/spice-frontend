import { useState, useEffect } from 'react';

interface ProductFormData {
    name: string;
    title: string;
    price: string;
    selling_price: string;
    quantity: string;
    sku: string;
    description: string;
    catagory: string;
    specification: string;
}

interface Category {
    _id?: string;
    name: string;
}

interface Specification {
    key: string;
    value: string;
}

interface ProductFormFieldsProps {
    productForm: ProductFormData;
    categories: Category[];
    onFormChange: (field: keyof ProductFormData, value: string) => void;
}

export default function ProductFormFields({ productForm, categories, onFormChange }: ProductFormFieldsProps) {
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');

    // Initialize specifications from existing specification JSON
    useEffect(() => {
        if (productForm.specification) {
            try {
                const parsed = JSON.parse(productForm.specification);
                if (typeof parsed === 'object' && parsed !== null) {
                    const specArray = Object.entries(parsed).map(([key, value]) => ({
                        key,
                        value: String(value)
                    }));
                    setSpecifications(specArray);
                }
            } catch (e) {
                // If parsing fails, keep default specifications
                console.warn('Failed to parse specification JSON', e);
            }
        } else {
            // If no specification, initialize with empty array
            setSpecifications([]);
        }
    }, [productForm.specification]);

    // Update the specification JSON whenever specifications change
    useEffect(() => {
        // Only update if we have specifications with non-empty keys
        if (specifications.some(spec => spec.key.trim() !== '')) {
            const specObject = specifications.reduce((acc, spec) => {
                if (spec.key.trim() !== '') {
                    acc[spec.key] = spec.value;
                }
                return acc;
            }, {} as Record<string, string>);

            const specString = JSON.stringify(specObject);
            if (specString !== productForm.specification) {
                onFormChange('specification', specString);
            }
        } else {
            // If no valid specifications, set to empty string
            if (productForm.specification !== '') {
                onFormChange('specification', '');
            }
        }
    }, [specifications]);

    const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
        const updatedSpecs = [...specifications];
        updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
        setSpecifications(updatedSpecs);
    };

    const removeSpecification = (index: number) => {
        const updatedSpecs = [...specifications];
        updatedSpecs.splice(index, 1);
        setSpecifications(updatedSpecs);
    };

    const addSpecification = () => {
        if (newSpecKey.trim() !== '') {
            setSpecifications([...specifications, { key: newSpecKey, value: newSpecValue }]);
            setNewSpecKey('');
            setNewSpecValue('');
        }
    };

    const addPredefinedSpecification = (key: string) => {
        // Check if this key already exists
        const exists = specifications.some(spec => spec.key.toLowerCase() === key.toLowerCase());
        if (!exists) {
            setSpecifications([...specifications, { key, value: '' }]);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => onFormChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={productForm.title}
                    onChange={(e) => onFormChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (INR) <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => onFormChange('price', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price (INR) <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    step="0.01"
                    value={productForm.selling_price}
                    onChange={(e) => onFormChange('selling_price', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    min="0"
                    step="1"
                    value={productForm.quantity}
                    onChange={(e) => onFormChange('quantity', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    placeholder="0"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU (Stock Keeping Unit)
                </label>
                <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => onFormChange('sku', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    placeholder="Optional product identifier"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                </label>
                <select
                    value={productForm.catagory}
                    onChange={(e) => onFormChange('catagory', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none bg-white"
                    required
                >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                        <option key={cat._id ?? cat.name} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    value={productForm.description}
                    onChange={(e) => onFormChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                />
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specifications
                </label>

                {/* Predefined specification buttons */}
                <div className="mb-4 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => addPredefinedSpecification('Material')}
                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm hover:bg-amber-200 transition-colors"
                    >
                        + Material
                    </button>
                    <button
                        type="button"
                        onClick={() => addPredefinedSpecification('Dimensions')}
                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm hover:bg-amber-200 transition-colors"
                    >
                        + Dimensions
                    </button>
                    <button
                        type="button"
                        onClick={() => addPredefinedSpecification('Weight')}
                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm hover:bg-amber-200 transition-colors"
                    >
                        + Weight
                    </button>
                    <button
                        type="button"
                        onClick={() => addPredefinedSpecification('Color')}
                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm hover:bg-amber-200 transition-colors"
                    >
                        + Color
                    </button>
                </div>

                {/* Specification inputs */}
                <div className="space-y-3">
                    {specifications.map((spec, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-start">
                            <div className="col-span-5">
                                <input
                                    type="text"
                                    value={spec.key}
                                    onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none text-sm"
                                    placeholder="Property"
                                />
                            </div>
                            <div className="col-span-6">
                                <input
                                    type="text"
                                    value={spec.value}
                                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none text-sm"
                                    placeholder="Value"
                                />
                            </div>
                            <div className="col-span-1">
                                <button
                                    type="button"
                                    onClick={() => removeSpecification(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add new specification */}
                <div className="mt-4 grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-5">
                        <input
                            type="text"
                            value={newSpecKey}
                            onChange={(e) => setNewSpecKey(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none text-sm"
                            placeholder="New Property"
                        />
                    </div>
                    <div className="col-span-6">
                        <input
                            type="text"
                            value={newSpecValue}
                            onChange={(e) => setNewSpecValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none text-sm"
                            placeholder="Value"
                        />
                    </div>
                    <div className="col-span-1">
                        <button
                            type="button"
                            onClick={addSpecification}
                            className="w-full h-9 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                        >
                            +
                        </button>
                    </div>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                    Add product specifications like material, dimensions, weight, etc.
                </p>
            </div>
        </div>
    );
}
