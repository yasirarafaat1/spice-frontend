import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { adminAPI } from '../../../services/api';
import AlertMessage from '../Admin/AlertMessage';
import ProductFormFields from './ProductFormFields';
import { getFriendlyErrorMessage } from '../../../utils/errorHandler';

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

export default function ProductUploadForm() {
    const [productForm, setProductForm] = useState<ProductFormData>({
        name: '',
        title: '',
        price: '',
        selling_price: '',
        quantity: '',
        sku: '',
        description: '',
        catagory: '',
        specification: '',
    });
    const [productMedia, setProductMedia] = useState<File[]>([]);
    const [productError, setProductError] = useState('');
    const [productSuccess, setProductSuccess] = useState('');
    const [isUploadingProduct, setIsUploadingProduct] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [catMessage, setCatMessage] = useState('');

    const [categories, setCategories] = useState<Category[]>([]);
    const [catError, setCatError] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await adminAPI.getCategories();
                if (res.data?.categories) {
                    setCategories(res.data.categories);
                }
            } catch (error) {
                console.error('Failed to load categories', error);
                setCatError('Categories could not be loaded. You can still type a new one.');
            }
        };
        loadCategories();
    }, []);

    const handleAddCategory = async () => {
        const name = newCategory.trim();
        if (!name) {
            setCatMessage('Category name required');
            return;
        }
        try {
            const res = await adminAPI.addCategory(name);
            const added = res.data?.category || res.data;
            setCategories((prev) => {
                const exists = prev.some((c) => c.name.toLowerCase() === name.toLowerCase());
                return exists ? prev : [...prev, { _id: added._id, name }];
            });
            setProductForm((p) => ({ ...p, catagory: name }));
            setCatMessage('Category added/selected');
            setNewCategory('');
        } catch (error: unknown) {
            const msg = getFriendlyErrorMessage(error);
            setCatMessage(msg || 'Failed to add category');
        }
    };

    const handleProductMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        // Allow adding media files, with maximum of 5 files total
        if (productMedia.length + files.length > 5) {
            setProductError('Maximum 5 media files allowed (images and videos combined)');
            return;
        }

        // Check file sizes - videos must be <= 5MB
        const maxSize = 1 * 1024 * 1024 * 1024; // 5GB in bytes      

         for (const file of files) {
        if (file.type.startsWith('video/') && file.size > maxSize) {
            setProductError('Video files must be 50MB or smaller');
            return;
        }
        // Also check image files for reasonable size (optional)
        if (file.type.startsWith('image/') && file.size > maxSize) {
            setProductError('Image files must be 5MB or smaller');
            return;
        }
    }

    // Add new media files to existing ones
    setProductMedia(prevMedia => [...prevMedia, ...files]);
    setProductError('');
};

const handleRemoveMedia = (index: number) => {
    setProductMedia(prevMedia => prevMedia.filter((_, i) => i !== index));
};

const handleFormChange = (field: keyof ProductFormData, value: string) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
};

const handleUploadProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (productMedia.length === 0) {
        setProductError('At least one media file (image or video) is required');
        return;
    }

    // Validate required fields (all except SKU)
    if (!productForm.name.trim()) {
        setProductError('Product name is required');
        return;
    }

    if (!productForm.title.trim()) {
        setProductError('Product title is required');
        return;
    }

    if (!productForm.catagory) {
        setProductError('Category is required');
        return;
    }

    if (!productForm.description.trim()) {
        setProductError('Description is required');
        return;
    }

    // Validate numeric fields
    const priceNum = parseFloat(productForm.price.trim());
    const sellingPriceNum = parseFloat(productForm.selling_price.trim());
    const quantityNum = parseInt(productForm.quantity.trim());

    if (isNaN(priceNum) || isNaN(sellingPriceNum) || isNaN(quantityNum)) {
        setProductError('Price, selling price, and quantity must be valid numbers');
        return;
    }

    if (quantityNum < 0) {
        setProductError('Quantity must be a valid positive number');
        return;
    }

    setIsUploadingProduct(true);
    setProductError('');
    setProductSuccess('');

    try {
        const formData = new FormData();

        // Add media files (images and videos)
        productMedia.forEach((media) => {
            formData.append('images', media);
        });

        // Add product data according to backend
        formData.append('name', productForm.name.trim());
        formData.append('title', productForm.title.trim());
        formData.append('price', priceNum.toString());
        formData.append('selling_price', sellingPriceNum.toString());
        formData.append('quantity', quantityNum.toString());
        if (productForm.sku.trim()) {
            formData.append('sku', productForm.sku.trim());
        } else {
            formData.append('sku', ''); // Send empty string if not provided
        }
        formData.append('description', productForm.description.trim());
        formData.append('catagory', productForm.catagory);

        // Add specification as JSON string if provided and valid
        if (productForm.specification.trim()) {
            try {
                // Validate that it's proper JSON
                const specs = JSON.parse(productForm.specification);
                // Only send if it's a valid object with content
                if (typeof specs === 'object' && specs !== null && Object.keys(specs).length > 0) {
                    formData.append('specification', JSON.stringify(specs));
                }
            } catch (parseError) {
                console.warn('⚠️ Invalid JSON in specification, skipping:', parseError);
                // Don't fail the whole request if specs are invalid, just skip them
            }
        }

        await adminAPI.uploadProduct(formData);
        setProductSuccess('Product uploaded successfully!');

        // Reset form
        setProductForm({
            name: '',
            title: '',
            price: '',
            selling_price: '',
            quantity: '',
            sku: '',
            description: '',
            catagory: '',
            specification: '',
        });
        setProductMedia([]);
    } catch (error: unknown) {
        console.error('❌ Product upload failed - Full error:', error);
        const errorMessage = getFriendlyErrorMessage(error);
        setProductError(`Upload failed: ${errorMessage}`);
    } finally {
        setIsUploadingProduct(false);
    }
};

return (
    <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Product</h2>

        {productError && (
            <AlertMessage
                type="error"
                message={productError}
                onClose={() => setProductError('')}
            />
        )}

        {productSuccess && (
            <AlertMessage
                type="success"
                message={productSuccess}
                onClose={() => setProductSuccess('')}
            />
        )}

        <form onSubmit={handleUploadProduct} className="space-y-6">
            <ProductFormFields
                productForm={productForm}
                categories={categories}
                onFormChange={handleFormChange}
            />
            {catError && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                    {catError}
                </p>
            )}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Add new category</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter new category name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    />
                    <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                    >
                        Add Category
                    </button>
                </div>
                {catMessage && <p className="text-xs text-gray-600">{catMessage}</p>}
            </div>

            {/* Updated Media Upload Component */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Media Files <span className="text-red-500">*</span> (Max 5 - Images & Videos, 50MB max each)
                </label>
                <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleProductMediaChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    multiple
                />
                {productMedia.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">{productMedia.length} media file(s) selected</p>
                )}
                {productError && productError.includes('media') && (
                    <p className="mt-1 text-sm text-red-600">{productError}</p>
                )}

                {/* Preview of selected media */}
                {productMedia.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                        {productMedia.map((media, index) => (
                            <div key={index} className="relative group">
                                {media.type.startsWith('video/') ? (
                                    // Video preview
                                    <div className="w-full h-32 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                                        <video className="w-full h-full object-cover rounded-lg" />
                                        <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                            Video
                                        </span>
                                    </div>
                                ) : (
                                    // Image preview
                                    <img
                                        src={URL.createObjectURL(media)}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveMedia(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isUploadingProduct}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isUploadingProduct ? 'Uploading...' : 'Upload Product'}
            </button>
        </form>
    </div>
);
}
