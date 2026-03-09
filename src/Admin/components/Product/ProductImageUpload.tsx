import { X } from 'lucide-react';

interface ProductImageUploadProps {
    productImages: File[];
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: (index: number) => void;
    error?: string;
}

export default function ProductImageUpload({ productImages, onImageChange, onRemoveImage, error }: ProductImageUploadProps) {
    // Wrapper function to add file size validation
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // Check file sizes - images must be <= 5MB
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > maxSize) {
                    alert('Image files must be 5MB or smaller');
                    return;
                }
            }
        }
        // Call the original handler if validation passes
        onImageChange(e);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Images <span className="text-red-500">*</span> (Max 4 - Upload one by one, 5MB max each)
            </label>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                required
            />
            {productImages.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">{productImages.length} image(s) selected</p>
            )}
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}

            {/* Preview of selected images */}
            {productImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {productImages.map((image, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                                type="button"
                                onClick={() => onRemoveImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}