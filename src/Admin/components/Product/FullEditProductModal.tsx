import { useState, useEffect } from 'react';
import { X, AlertCircle, Save } from 'lucide-react';
import { ProductFormData } from '../../types';
import MediaUpload from './MediaUpload';
import { getFriendlyErrorMessage } from '../../../utils/errorHandler';
import { adminAPI } from '../../../services/api';
import { Plus } from 'lucide-react';

interface Specification {
    key: string;
    value: string;
}

interface Product {
    product_id: number;
    name: string;
    title: string;
    price: number;
    selling_price: number;
    quantity: number;
    sku: string | null;
    description: string | null;
    product_image: string | string[] | { [key: string]: string };
    catagory_id: number;
    Catagory?: {
        id: number;
        name: string;
    };
    selling_price_link?: string;
    ProductSpecifications?: Array<{
        spec_id: number;
        key: string;
        value: string;
    }>;
}

interface FullEditProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (productId: number, formData: FormData) => Promise<void>;
}

export default function FullEditProductModal({ product, isOpen, onClose, onSave }: FullEditProductModalProps) {
    const [formData, setFormData] = useState<ProductFormData>({
        images: [],
        name: '',
        title: '',
        description: '',
        mrp: 0,
        sellingPrice: 0,
        discountPercentage: 0,
        specification: '',
        stock: 0,
        stockType: 'number',
        category: '',
        skuId: ''
    });

    const [specifications, setSpecifications] = useState<Specification[]>([
    ]);
    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');

    // Initialize specifications from existing specification JSON
    useEffect(() => {
        if (formData.specification) {
            try {
                const parsed = JSON.parse(formData.specification);
                const specArray = Object.entries(parsed).map(([key, value]) => ({
                    key,
                    value: String(value)
                }));
                setSpecifications(specArray);
            } catch (e) {
                // If parsing fails, keep default specifications
                console.warn('Failed to parse specification JSON', e);
            }
        }
    }, [formData.specification]);

    // Update the specification JSON whenever specifications change
    useEffect(() => {
        const specObject = specifications.reduce((acc, spec) => {
            if (spec.key.trim() !== '') {
                acc[spec.key] = spec.value;
            }
            return acc;
        }, {} as Record<string, string>);

        const specString = JSON.stringify(specObject);
        if (specString !== formData.specification) {
            setFormData(prev => ({ ...prev, specification: specString }));
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

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState('');

    // load categories from backend
    useEffect(() => {
        const loadCats = async () => {
            try {
                const res = await adminAPI.getCategories();
                const apiCats = res.data?.categories?.map((c: { name: string }) => c.name) || [];
                setCategories(apiCats);
            } catch (err) {
                console.error('Failed to load categories', err);
                setCategories([]);
            }
        };
        if (isOpen) loadCats();
    }, [isOpen]);

    const handleAddCategory = async () => {
        const name = newCategory.trim();
        if (!name) return;
        try {
            const res = await adminAPI.addCategory(name);
            const addedName = res.data?.category?.name || name;
            setCategories((prev) => (prev.includes(addedName) ? prev : [...prev, addedName]));
            setFormData((prev) => ({ ...prev, category: addedName }));
            setNewCategory('');
        } catch (err) {
            console.error('Failed to add category', err);
        }
    };

    // Initialize form with product data
    useEffect(() => {
        if (product && isOpen) {
            // Convert product specifications to JSON string
            let specificationJson = '{}';
            if (product.ProductSpecifications && product.ProductSpecifications.length > 0) {
                const specObject: Record<string, string> = {};
                product.ProductSpecifications.forEach(spec => {
                    specObject[spec.key] = spec.value;
                });
                specificationJson = JSON.stringify(specObject);
            }

            // Convert product data to form data
            const initialFormData: ProductFormData = {
                images: typeof product.product_image === 'string'
                    ? [product.product_image]
                    : Array.isArray(product.product_image)
                        ? product.product_image
                        : Object.values(product.product_image || {}),
                name: product.name || '',
                title: product.title || '',
                description: product.description || '',
                mrp: product.price || 0,
                sellingPrice: product.selling_price || 0,
                discountPercentage: product.price && product.selling_price
                    ? Math.round(((product.price - product.selling_price) / product.price) * 100)
                    : 0,
                specification: specificationJson,
                stock: product.quantity || 0,
                stockType: typeof product.quantity === 'number' ? 'number' : 'dropdown',
                category: product.Catagory?.name || '',
                skuId: product.sku || ''
            };

            setFormData(initialFormData);
            setErrors({});
            setSuccess('');
        }
    }, [product, isOpen]);
    if (!isOpen || !product) return null;

    const updateField = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error for this field if it exists
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        // Recalculate discount if price or selling price changes
        if (field === 'mrp' || field === 'sellingPrice') {
            const newMrp = field === 'mrp' ? Number(value) : formData.mrp;
            const newSellingPrice = field === 'sellingPrice' ? Number(value) : formData.sellingPrice;

            if (newMrp > 0 && newSellingPrice > 0 && newMrp >= newSellingPrice) {
                const discount = Math.round(((newMrp - newSellingPrice) / newMrp) * 100);
                setFormData(prev => ({ ...prev, discountPercentage: discount }));
            }
        }
    };

    const getMediaUrl = (media: File | string): string => {
        if (typeof media === 'string') {
            return media;
        }
        return URL.createObjectURL(media);
    };

    const onMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        // Allow adding media files, with maximum of 5 files total
        const currentMediaCount = formData.images.length;
        const newMediaCount = files.length;
        if (currentMediaCount + newMediaCount > 5) {
            setErrors(prev => ({ ...prev, images: 'Maximum 5 media files allowed (images and videos combined)' }));
            return;
        }
        
        // Check file sizes - videos must be <= 5MB
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        for (const file of files) {
            if (file.type.startsWith('video/') && file.size > maxSize) {
                setErrors(prev => ({ ...prev, images: 'Video files must be 5MB or smaller' }));
                return;
            }
            // Also check image files for reasonable size (optional)
            if (file.type.startsWith('image/') && file.size > maxSize) {
                setErrors(prev => ({ ...prev, images: 'Image files must be 5MB or smaller' }));
                return;
            }
        }

        updateField('images', [...formData.images, ...files] as (File | string)[]);
        if (errors.images) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.images;
                return newErrors;
            });
        }
    };

    const onRemoveMedia = (index: number) => {
        const newMedia = [...formData.images];
        newMedia.splice(index, 1);
        updateField('images', newMedia as (File | string)[]);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate required fields (all except SKU)
        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (formData.mrp <= 0) {
            newErrors.mrp = 'MRP must be greater than 0';
        }

        if (formData.sellingPrice <= 0) {
            newErrors.sellingPrice = 'Selling price must be greater than 0';
        }

        if (formData.sellingPrice > formData.mrp) {
            newErrors.sellingPrice = 'Selling price cannot be greater than MRP';
        }

        // selling price link no longer required

        try {
            if (formData.specification) {
                JSON.parse(formData.specification);
            }
        } catch (_err /* eslint-disable-line @typescript-eslint/no-unused-vars */) {
            newErrors.specification = 'Specification must be valid JSON';
        }

        if (formData.stockType === 'number' && (typeof formData.stock !== 'number' || formData.stock < 0)) {
            newErrors.stock = 'Valid quantity is required';
        }

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        if (formData.images.length === 0) {
            newErrors.images = 'At least one media file (image or video) is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setSuccess('');

        try {
            // Create FormData object for multipart upload
            const form = new FormData();

            // Append product data
            form.append('name', formData.name || '');
            form.append('title', formData.title);
            form.append('price', formData.mrp.toString());
            form.append('selling_price', formData.sellingPrice.toString());
            form.append('quantity', typeof formData.stock === 'number' ? formData.stock.toString() : formData.stock);
            form.append('sku', formData.skuId);
            form.append('description', formData.description);
            form.append('catagory', formData.category);

            // Append media files (only new ones that are File objects)
            const newMedia = formData.images.filter(media => media instanceof File);
            newMedia.forEach((media) => {
                form.append('images', media);
            });

            // Parse specification
            let specificationObj: Record<string, unknown> = {};
            try {
                specificationObj = formData.specification ? JSON.parse(formData.specification) : {};
            } catch (_e /* eslint-disable-line @typescript-eslint/no-unused-vars */) {
                // If parsing fails, use empty object
                specificationObj = {};
            }

            // Append specification as JSON string
            form.append('specification', JSON.stringify(specificationObj));

            // selling_price_link removed

            await onSave(product.product_id, form);
            setSuccess('Product updated successfully!');
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: unknown) {
            console.error('Error updating product:', err);
            const errorMessage = getFriendlyErrorMessage(err);
            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {success && (
                    <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">{success}</p>
                    </div>
                )}

                {errors.submit && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 flex items-center gap-2">
                            <AlertCircle size={18} />
                            {errors.submit}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Media Upload */}
                    <div>
                        <MediaUpload
                            mediaFiles={formData.images}
                            errors={errors.images}
                            onMediaChange={onMediaChange}
                            onRemoveMedia={onRemoveMedia}
                            getMediaUrl={getMediaUrl}
                            getMaxMediaCount={() => 5}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Note: You can upload a combination of up to 5 images and videos. Uploading new media will replace all existing ones.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => updateField('name', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                                placeholder="Enter product name"
                                disabled={loading}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                                placeholder="Enter product title"
                                disabled={loading}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price (INR) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.mrp}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    updateField('mrp', value);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                                placeholder="0.00"
                                disabled={loading}
                            />
                            {errors.mrp && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.mrp}
                                </p>
                            )}
                        </div>

                        {/* Selling Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Selling Price (INR) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.sellingPrice}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    updateField('sellingPrice', value);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                                placeholder="0.00"
                                disabled={loading}
                            />
                            {errors.sellingPrice && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.sellingPrice}
                                </p>
                            )}
                        </div>

                        {/* Selling Price Link */}
                        <div>
                            {/* Selling price link removed */}
                        </div>

                        {/* Quantity/Stock */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            {formData.stockType === 'number' ? (
                                <input
                                    type="number"
                                    min="0"
                                    value={typeof formData.stock === 'number' ? formData.stock : ''}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        updateField('stock', value);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                                    placeholder="0"
                                    disabled={loading}
                                />
                            ) : (
                                <select
                                    value={formData.stock as string}
                                    onChange={(e) => {
                                        updateField('stock', e.target.value as 'in stock');
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                                    disabled={loading}
                                >
                                    <option value="in stock">In Stock</option>
                                </select>
                            )}
                            {errors.stock && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.stock}
                                </p>
                            )}
                        </div>

                        {/* SKU */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                SKU (Stock Keeping Unit)
                            </label>
                            <input
                                type="text"
                                value={formData.skuId}
                                onChange={(e) => updateField('skuId', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                                placeholder="Optional product identifier"
                                disabled={loading}
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                <select
                                    value={formData.category}
                                    onChange={(e) => updateField('category', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none bg-white"
                                    disabled={loading}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="Create new category"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        className="px-3 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-60"
                                        disabled={loading}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.category}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Specifications
                        </h3>
                        <div className="space-y-4">
                            {/* Predefined specification buttons */}
                            <div className="flex flex-wrap gap-2">
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
                            <div className="grid grid-cols-12 gap-2 items-start">
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

                            <p className="text-xs text-gray-500">
                                Add product specifications like material, dimensions, weight, etc.
                            </p>
                        </div>
                    </div>

                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
                            <div className="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Update Product
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
