import { useState, useEffect } from 'react';
import { Star, Plus, BadgeCheck, X, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { productAPI } from '../../services/api';
import ReviewForm from './ReviewForm';
import { useAuth } from '../../context/AuthContext';

// Define the interface for the component props
interface ProductReviewsProps {
    productId: number;
}

interface ImageModalProps {
    imageUrl: string;
    onClose: () => void;
}

const ImageModal = ({ imageUrl, onClose }: ImageModalProps) => {
    return (
        <div
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute -top-14 right-0 p-3 bg-white/10 rounded-full text-white hover:bg-orange-600 hover:rotate-90 transition-all duration-300"
                >
                    <X size={24} />
                </button>
                <img
                    src={imageUrl}
                    alt="Review High Res"
                    className="max-w-full max-h-[80vh] rounded-3xl object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                />
            </div>
        </div>
    );
};

interface Review {
    id: number;
    user_name: string;
    review_title: string;
    review_text: string;
    review_rate: number;
    review_image?: string;
    createdAt: string;
    user_review_count?: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
    const { user, isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState('');

    useEffect(() => {
        loadReviews();
    }, [productId]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getProductReviews(productId);
            const list = response?.data?.reviews || response?.data?.data || [];
            
            if (Array.isArray(list)) {
                const sorted = [...list].sort((a: Review, b: Review) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setReviews(sorted);
            } else { 
                setReviews([]); 
            }
        } catch (err) {
            console.error("Review Load Error:", err);
            setError('Spices too hot, failed to load reviews.');
        } finally { 
            setLoading(false); 
        }
    };

    const handleReviewSubmitted = () => {
        setShowReviewForm(false);
        loadReviews();
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    const mediaSource = (media?: string) =>
        media ? (media.startsWith('http') ? media : `${import.meta.env.VITE_SERVER_URL}/${media}`) : '';

    const allImages = reviews
        .map((r) => r.review_image)
        .filter((url): url is string => !!url)
        .map((url) => mediaSource(url));

    if (loading) return (
        <div className="space-y-6 pt-10">
            <div className="h-10 bg-white/5 rounded-1xl w-64 animate-pulse"></div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-white/[0.02] border border-white/5 rounded-[2.5rem] w-full animate-pulse"></div>
            ))}
        </div>
    );

    return (
        <div className="pt-10 border-t border-white/5 mt-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <MessageSquare className="text-orange-500" size={28} />
                        Fire Feedback <span className="text-orange-600">({reviews.length})</span>
                    </h3>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Verified Taste Tests</p>
                </div>

                {isAuthenticated && !showReviewForm && (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="group flex items-center gap-2 px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-orange-600 hover:text-white transition-all shadow-2xl active:scale-95"
                    >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Write Review
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 text-xs font-bold uppercase tracking-widest">
                    {error}
                </div>
            )}

            {showReviewForm && (
                <div className="mb-12 bg-white/[0.03] border border-white/10 p-8 rounded-[3rem] shadow-2xl animate-in slide-in-from-top duration-500">
                    <ReviewForm
                        productId={productId}
                        userEmail={user?.email ?? ''}
                        onReviewSubmitted={handleReviewSubmitted}
                        onCancel={() => setShowReviewForm(false)}
                    />
                </div>
            )}

            {/* Aggregated customer photos */}
            {allImages.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <ImageIcon className="text-orange-500" size={22} />
                        <h4 className="text-lg font-black text-white uppercase tracking-widest">Customer Photos</h4>
                        <span className="text-xs text-gray-500">({allImages.length})</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                className="shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-white/10 hover:border-orange-500 transition-all"
                                onClick={() => {
                                    setCurrentImageUrl(img);
                                    setShowImageModal(true);
                                }}
                            >
                                <img
                                    src={img}
                                    className="w-full h-full object-cover"
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Image')}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {reviews.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.01] border border-dashed border-white/10 rounded-[1rem]">
                    <div className="bg-orange-600/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star className="text-orange-500" size={32} />
                    </div>
                    <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No heat yet. Be the first to spark a review!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="group bg-[#0A0A0A] border border-white/5 hover:border-orange-600/40 p-5 rounded-2xl transition-all duration-500 shrink-0 w-[340px]"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Image thumb */}
                                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0 flex items-center justify-center">
                                        {review.review_image ? (
                                            <img
                                                className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 hover:scale-110"
                                                src={mediaSource(review.review_image)}
                                                onClick={() => {
                                                    setCurrentImageUrl(mediaSource(review.review_image));
                                                    setShowImageModal(true);
                                                }}
                                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Image')}
                                            />
                                        ) : (
                                            <ImageIcon size={20} className="text-gray-500" />
                                        )}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 flex flex-col gap-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-black italic shadow-[0_4px_15px_rgba(234,88,12,0.3)] w-fit">
                                                {review.review_rate} <Star size={12} fill="currentColor" />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest whitespace-nowrap">
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>

                                        <h4 className="text-base font-black text-white uppercase tracking-tight group-hover:text-orange-500 transition-colors line-clamp-2">
                                            {review.review_title}
                                        </h4>

                                        <p className="text-gray-400 leading-relaxed text-sm italic font-medium line-clamp-3">
                                            "{review.review_text}"
                                        </p>

                                        {/* User Footer */}
                                        <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 font-black text-sm">
                                                {review.user_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-white uppercase tracking-widest">{review.user_name}</span>
                                                {review.user_review_count && review.user_review_count >= 10 && (
                                                    <div className="flex items-center gap-1.5 text-blue-400 mt-1">
                                                        <BadgeCheck size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-tighter">Verified Legend</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showImageModal && <ImageModal imageUrl={currentImageUrl} onClose={() => setShowImageModal(false)} />}
        </div>
    );
}
