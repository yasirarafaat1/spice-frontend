import { useState } from 'react';
import { Star, Check, X, ShieldCheck } from 'lucide-react';
import WishlistButton from './WishlistButton';
import { Product } from '../../utils/productUtils';

interface ProductSpecification {
    specification_id?: number;
    key?: string;
    value?: string;
}

interface ProductInfoProps {
    name: string;
    title?: string;
    description?: string;
    price: number;
    sellingPrice: number;
    specifications?: ProductSpecification[];
    quantity: number;
    product: Product;
    averageRating?: number;
    reviewCount?: number;
}

export default function ProductInfo({
    name,
    title,
    description,
    price,
    sellingPrice,
    specifications,
    quantity,
    product,
    averageRating = 0,
    reviewCount = 0
}: ProductInfoProps) {
    const [showFullDescription, setShowFullDescription] = useState(false);

    const fullProductName = name || title || 'Premium Product';

    const truncateDescription = (desc: string, wordLimit: number = 40) => {
        if (!desc) return '';
        const words = desc.split(' ');
        if (words.length <= wordLimit) return desc;
        return words.slice(0, wordLimit).join(' ') + '...';
    };

    const truncatedDescription = description ? truncateDescription(description) : '';
    const shouldTruncate = description && description.split(' ').length > 40;

    const formatDescription = (desc: string) => {
        if (!desc) return null;
        const paragraphs = desc.split('\n').filter(p => p.trim());
        return (
            <div className="space-y-4">
                {paragraphs.map((para, index) => (
                    <p key={index} className="text-gray-400 leading-relaxed text-sm sm:text-base">
                        {para.trim()}
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-1 bg-orange-600/20 px-2 py-1 rounded border border-orange-500/30">
                        <Star size={14} className="fill-orange-500 text-orange-500" />
                        <span className="text-orange-500 font-black text-xs uppercase">{averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                        {reviewCount} Verified Reviews
                    </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
                    {fullProductName}
                </h1>

                {description && (
                    <div className="relative">
                        {formatDescription(showFullDescription ? description : truncatedDescription)}
                        {shouldTruncate && (
                            <button
                                onClick={() => setShowFullDescription(!showFullDescription)}
                                className="text-orange-500 hover:text-orange-400 font-black text-[10px] uppercase tracking-[0.2em] mt-4 block transition-colors"
                            >
                                {showFullDescription ? '[ Read Less ]' : '[ Read Full Story ]'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Price & Shipping Section */}
            <div className="py-6 border-y border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <div className="flex items-baseline gap-4">
                        <span className="text-4xl sm:text-5xl font-black text-white">
                            ₹{sellingPrice || price}
                        </span>
                        {price > sellingPrice && (
                            <span className="text-xl text-gray-600 line-through font-medium">
                                ₹{price}
                            </span>
                        )}
                    </div>
                    <p className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                        <ShieldCheck size={14} /> Free Express Delivery
                    </p>
                </div>

                {price > sellingPrice && (
                    <div className="bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-tighter italic">
                        OFF {Math.round((1 - sellingPrice / price) * 100)}%
                    </div>
                )}
            </div>

            {/* Specifications Grid */}
            {specifications && specifications.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    {specifications.map((spec, index) => (
                        <div key={index} className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl hover:border-orange-500/30 transition-colors">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
                                {spec.key}
                            </span>
                            <p className="text-white font-bold text-sm sm:text-base">
                                {spec.value}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Status & Wishlist Actions */}
            <div className="flex items-center justify-between pt-4">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${
                    quantity > 0 
                    ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                    {quantity > 0 ? <Check size={16} /> : <X size={16} />}
                    <span className="text-xs font-black uppercase tracking-widest">
                        {quantity > 0 ? 'Batch Available' : 'Sold Out'}
                    </span>
                </div>

                <div className="p-1 bg-white/[0.03] rounded-2xl border border-white/5">
                    <WishlistButton
                        product={product}
                        size="lg"
                        showLabel={true}
                    />
                </div>
            </div>
        </div>
    );
}