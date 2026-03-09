import React, { useState, useEffect } from 'react';
import { Star, Upload, X, Loader2 } from 'lucide-react';
import { productAPI } from '../../services/api';

interface ReviewFormProps {
    productId: number;
    userEmail: string;
    onReviewSubmitted: () => void;
    onCancel: () => void;
}

export default function ReviewForm({ productId, userEmail, onReviewSubmitted, onCancel }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Cleanup object URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            // Revoke old preview if exists
            if (imagePreview) URL.revokeObjectURL(imagePreview);

            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const removeImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) return setError('Please select a rating');
        if (!title.trim()) return setError('Please enter a title');
        if (!comment.trim()) return setError('Please enter your comment');
        if (!image) return setError('Please upload an image');

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            // Matching the keys expected by your ProductReviews component
            formData.append('user_name', userEmail.split('@')[0]);
            formData.append('email', userEmail);
            formData.append('review_title', title);
            formData.append('review_text', comment);
            formData.append('review_rate', rating.toString());
            formData.append('product_id', productId.toString());
            formData.append('reviewImage', image);

            await productAPI.addProductReview(formData);
            onReviewSubmitted();
        } catch (err) {
            console.error('Failed to submit review:', err);
            setError('Failed to submit. Spice level too high? Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-transparent">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Write a Review</h3>
                <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Rating Selection */}
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                        Your Heat Rating
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform active:scale-90"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                <Star
                                    size={28}
                                    className={`${star <= (hoverRating || rating)
                                        ? 'text-orange-500 fill-orange-500'
                                        : 'text-white/10'
                                        } transition-colors duration-200`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input Fields */}
                <div className="grid gap-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Review Title (e.g. Pure Magic!)"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                    />
                    <textarea
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none"
                    />
                </div>

                {/* Image Upload Area */}
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                        Proof of Spice (Image Required)
                    </label>
                    <div className="flex items-center gap-4">
                        <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group">
                            <Upload size={20} className="text-gray-500 group-hover:text-orange-500" />
                            <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Upload</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>

                        {imagePreview && (
                            <div className="relative group/preview">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-24 h-24 object-cover rounded-2xl border border-orange-500/30"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        {error}
                    </p>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50 active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Spark'}
                    </button>
                </div>
            </form>
        </div>
    );
}
