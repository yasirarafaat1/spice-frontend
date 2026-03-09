import { useState } from 'react';
import { adminAPI } from '../../../services/api';
import AlertMessage from '../Admin/AlertMessage';

export default function CategoryForm() {
    const [categoryName, setCategoryName] = useState('');
    const [categoryError, setCategoryError] = useState('');
    const [categorySuccess, setCategorySuccess] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) {
            setCategoryError('Category name is required');
            return;
        }

        setIsAddingCategory(true);
        setCategoryError('');
        setCategorySuccess('');

        try {
            await adminAPI.addCategory(categoryName.trim());
            setCategorySuccess('Category added successfully!');
            setCategoryName('');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            setCategoryError(err.response?.data?.message || err.message || 'Failed to add category. Please try again.');
        } finally {
            setIsAddingCategory(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Category</h2>

            {categoryError && (
                <AlertMessage
                    type="error"
                    message={categoryError}
                    onClose={() => setCategoryError('')}
                />
            )}

            {categorySuccess && (
                <AlertMessage
                    type="success"
                    message={categorySuccess}
                    onClose={() => setCategorySuccess('')}
                />
            )}

            <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                        placeholder="e.g., Kiswah Clothes"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isAddingCategory}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAddingCategory ? 'Adding...' : 'Add Category'}
                </button>
            </form>
        </div>
    );
}

