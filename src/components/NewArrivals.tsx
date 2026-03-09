import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Clock, ArrowRight, Star, ShoppingBag } from 'lucide-react';
import { productAPI } from '../services/api';
import { Product, getImageUrl } from '../utils/productUtils';
import { useNavigation } from "../utils/navigation";
import SkeletonLoader from './UI/SkeletonLoader';
import { productCache } from '../services/productCache';

interface Review {
    id: number;
    review_rate: number;
}

interface ProductWithRating extends Product {
    averageRating?: number;
    reviewCount?: number;
}

export default function NewArrivals() {
    const [products, setProducts] = useState<ProductWithRating[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isContentVisible, setIsContentVisible] = useState(false);
    const { go } = useNavigation();
    const [ratingsCache, setRatingsCache] = useState<Record<number, { averageRating: number; reviewCount: number }>>({});

    const fetchFreshProducts = async () => {
        try {
            const response = await productAPI.getProducts();
            if (response.data.status && Array.isArray(response.data.products)) {
                const newArrivals = response.data.products
                    .sort((a: Product, b: Product) =>
                        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                    )
                    .slice(0, 8);

                productCache.setCachedNewArrivals(newArrivals);
                setProducts(newArrivals);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadProducts = async () => {
        setIsLoading(true);
        const cached = productCache.getCachedNewArrivals();
        if (cached) {
            setProducts(cached);
            setIsLoading(false);
            fetchFreshProducts();
        } else {
            await fetchFreshProducts();
        }
    };

    useEffect(() => { loadProducts(); }, []);

    useEffect(() => {
        if (!isLoading && products.length > 0) {
            const timer = setTimeout(() => setIsContentVisible(true), 150);
            return () => clearTimeout(timer);
        }
    }, [isLoading, products.length]);

    const fetchProductRating = useCallback(async (productId: number) => {
        if (ratingsCache[productId]) return;
        try {
            const response = await productAPI.getProductReviews(productId);
            const list = response?.data?.reviews || [];
            const reviewCount = list.length;
            const averageRating = reviewCount > 0
                ? list.reduce((sum: number, r: Review) => sum + Number(r.review_rate), 0) / reviewCount
                : 0;
            setRatingsCache(prev => ({ ...prev, [productId]: { averageRating, reviewCount } }));
        } catch { /* silent fail */ }
    }, [ratingsCache]);

    useEffect(() => {
        if (products.length > 0 && !isLoading) {
            products.forEach(p => fetchProductRating(p.product_id));
        }
    }, [products, fetchProductRating, isLoading]);

    if (!isLoading && products.length === 0) return null;

    return (
        <section className="bg-[#050505] py-20 sm:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header: Fire Styled */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-orange-500 font-black uppercase tracking-[0.3em] text-[10px]">
                            <div className="w-8 h-[1px] bg-orange-500"></div>
                            <Clock size={12} className="animate-pulse" />
                            <span>Freshly Dropped</span>
                        </div>
                        <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                            The New <span className="text-orange-600 italic">Era</span>
                        </h2>
                    </div>
                    <button
                        onClick={() => go('/categories')}
                        className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-orange-500 transition-all border-b border-white/10 pb-2 hover:border-orange-500"
                    >
                        See All Heat
                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>

                {/* Grid */}
                <div className={`grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 transition-all duration-1000 ${isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <SkeletonLoader key={i} type="card" />)
                    ) : (
                        products.map((product) => {
                            const imageUrl = getImageUrl(product.product_image);
                            const ratingData = ratingsCache[product.product_id];

                            return (
                                <div
                                    key={product.product_id}
                                    onClick={() => go(`/product/${product.product_id}`)}
                                    className="group relative cursor-pointer"
                                >
                                    {/* Image Wrapper */}
                                    <div className="relative aspect-[3/4] overflow-hidden bg-white/[0.03] rounded-[2rem] border border-white/5 group-hover:border-orange-600/30 transition-all duration-500">
                                        
                                        {/* Badges */}
                                        <div className="absolute top-4 left-4 z-20">
                                            <span className="bg-white text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-2xl">
                                                <Sparkles size={10} /> NEW
                                            </span>
                                        </div>

                                        <img
                                            src={imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-110"
                                        />

                                        {/* Dark Overlay on Hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                        
                                        {/* Quick Add Button Icon (Visual only) */}
                                        <div className="absolute bottom-6 right-6 bg-orange-600 text-white p-3 rounded-2xl translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_10px_30px_rgba(234,88,12,0.4)]">
                                            <ShoppingBag size={18} />
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="mt-6 space-y-2 px-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex flex-col gap-1">
                                                {ratingData && ratingData.averageRating > 0 ? (
                                                    <div className="flex items-center text-orange-500 gap-1">
                                                        <Star size={10} fill="currentColor" />
                                                        <span className="text-[10px] font-black">{ratingData.averageRating.toFixed(1)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Uncharted</span>
                                                )}
                                                <h3 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1 group-hover:text-orange-500 transition-colors">
                                                    {product.name || product.title}
                                                </h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-white leading-none">
                                                    ₹{product.selling_price || product.price}
                                                </p>
                                                {product.price > (product.selling_price || 0) && (
                                                    <p className="text-[10px] text-white/30 line-through mt-1">
                                                        ₹{product.price}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}
