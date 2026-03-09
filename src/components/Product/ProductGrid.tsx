import { useState, useEffect, useCallback, useRef } from 'react';
import ProductCard from './ProductCard';
import { Check, Flame, Filter } from 'lucide-react';
import { productAPI } from '../../services/api';
import { productCache } from '../../services/productCache';
import { Product, getImageUrl, isProductNew, isProductBestSeller } from '../../utils/productUtils';
import SkeletonLoader from '../UI/SkeletonLoader';

// Types and Interfaces
interface Review {
    id: number;
    review_rate: number;
}

interface ProductWithRating extends Product {
    averageRating?: number;
    reviewCount?: number;
}

export default function ProductGrid({ searchQuery }: { searchQuery?: string }) {
    // States
    const [products, setProducts] = useState<ProductWithRating[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Products');
    const [sortBy, setSortBy] = useState('popularity');
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [displayedProductsCount, setDisplayedProductsCount] = useState(8);
    const [ratingsCache, setRatingsCache] = useState<Record<number, { averageRating: number; reviewCount: number }>>({});

    // Refs
    const observer = useRef<IntersectionObserver | null>(null);
    const lastProductRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Initial Load & Categories
    useEffect(() => {
        const loadCats = async () => {
            try {
                const res = await productAPI.getCategories();
                const apiCats = res.data?.categories?.map((c: { name: string }) => c.name) || [];
                setCategories(['All Products', ...apiCats]);
            } catch {
                setCategories(['All Products']);
            }
        };
        loadCats();
        loadInitialProducts();
    }, []);

    const loadInitialProducts = async () => {
        setIsLoading(true);
        const cacheKey = `products-page-1`;
        const cached = productCache.getCachedProducts(cacheKey);

        if (cached) {
            setProducts(cached);
            setIsLoading(false);
            // Background refresh
            fetchProducts(1, true);
        } else {
            await fetchProducts(1, true);
        }
    };

    // 2. Fetching Logic
    const fetchProducts = async (page: number, isReset: boolean = false) => {
        try {
            if (!isReset) setIsLoadingMore(true);
            
            const response = await (selectedCategory === 'All Products' 
                ? productAPI.getProducts(page, 12) 
                : productAPI.getProductByCategory(selectedCategory, page, 12));

            const rawProducts = response.data?.products || response.data?.data?.Products || [];
            
            if (Array.isArray(rawProducts)) {
                const newProducts = rawProducts.map((p: Product) => ({
                    ...p,
                    ...(ratingsCache[p.product_id] || {})
                }));

                setProducts(prev => isReset ? newProducts : [...prev, ...newProducts]);
                setHasMore(rawProducts.length === 12);
                setCurrentPage(page + 1);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    // 3. Batch Rating Loader (Optimized)
    const loadRatings = useCallback(async () => {
        const targets = products.filter(p => ratingsCache[p.product_id] === undefined);
        if (targets.length === 0) return;

        const batch = targets.slice(0, 5);
        for (const product of batch) {
            try {
                const res = await productAPI.getProductReviews(product.product_id);
                const reviews = res.data?.reviews || [];
                const avg = reviews.length > 0 ? reviews.reduce((s: number, r: Review) => s + r.review_rate, 0) / reviews.length : 0;
                const data = { averageRating: avg, reviewCount: reviews.length };
                
                setRatingsCache(prev => ({ ...prev, [product.product_id]: data }));
                setProducts(prev => prev.map(p => p.product_id === product.product_id ? { ...p, ...data } : p));
            } catch (e) { /* ignore */ }
        }
    }, [products, ratingsCache]);

    useEffect(() => {
        const timer = setTimeout(() => loadRatings(), 1000);
        return () => clearTimeout(timer);
    }, [products, loadRatings]);

    // 4. Infinite Scroll Observer
    useEffect(() => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                fetchProducts(currentPage);
            }
        });

        if (lastProductRef.current) observer.current.observe(lastProductRef.current);
    }, [hasMore, isLoadingMore, currentPage]);

    // 5. Filter & Sort Logic
    const filteredAndSorted = products
        .filter(p => {
            const matchesSearch = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        })
        .sort((a, b) => {
            const priceA = a.selling_price || a.price;
            const priceB = b.selling_price || b.price;
            switch (sortBy) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'newest': {
                    const da = new Date(a.createdAt || 0).getTime();
                    const db = new Date(b.createdAt || 0).getTime();
                    return db - da;
                }
                case 'popularity':
                default: {
                    const ra = ratingsCache[a.product_id]?.reviewCount || 0;
                    const rb = ratingsCache[b.product_id]?.reviewCount || 0;
                    if (rb !== ra) return rb - ra;
                    // tie-breaker by rating then newest
                    const aa = ratingsCache[a.product_id]?.averageRating || 0;
                    const ab = ratingsCache[b.product_id]?.averageRating || 0;
                    if (ab !== aa) return ab - aa;
                    const da = new Date(a.createdAt || 0).getTime();
                    const db = new Date(b.createdAt || 0).getTime();
                    return db - da;
                }
            }
        });

    return (
        <div className="bg-[#050505] min-h-screen">
            {/* Header Section */}
            <div className="bg-[#050505] border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] pointer-events-none" />
                <div className="max-w-[1440px] mx-auto px-6 py-12 md:py-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-orange-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                <Flame size={14} className="fill-orange-500 animate-pulse" />
                                <span>The Vault Collection</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85]">
                                Featured <br /> <span className="text-orange-600 italic">Gear</span>
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row px-4 md:px-8 py-10 gap-10">
                {/* Sidebar */}
                <aside className="hidden lg:block w-64 flex-shrink-0 self-start sticky top-24">
                    <h3 className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-[0.3em] mb-8">
                        <Filter size={14} className="text-orange-500" /> Filter By
                    </h3>
                    <div className="flex flex-col gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => { setSelectedCategory(cat); fetchProducts(1, true); }}
                                className={`text-left text-sm font-bold uppercase tracking-tighter transition-all flex items-center justify-between group
                                    ${selectedCategory === cat ? 'text-orange-500 pl-4 border-l-2 border-orange-500' : 'text-white/30 hover:text-white hover:pl-2'}`}
                            >
                                {cat}
                                {selectedCategory === cat && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Grid */}
                <main className="flex-1 min-w-0">
                    {/* Category dropdown (all breakpoints) */}
                    <div className="mb-4 bg-black text-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 flex items-center justify-between">
                        <select
                            value={selectedCategory}
                            onChange={(e) => { setSelectedCategory(e.target.value); fetchProducts(1, true); }}
                            className="w-full bg-transparent text-sm font-semibold outline-none appearance-none pr-8"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <span className="text-gray-500 text-xs">▼</span>
                    </div>

                    {/* Sort bar */}
                    <div className="mb-6">
                        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                            {['popularity', 'price-low', 'price-high', 'newest'].map((option) => {
                                const label =
                                    option === 'price-low' ? 'Price: Low-High' :
                                        option === 'price-high' ? 'Price: High-Low' :
                                            option === 'popularity' ? 'Popularity' : 'Newest First';
                                return (
                                    <button
                                        key={option}
                                        onClick={() => setSortBy(option)}
                                        className="relative pb-2 whitespace-nowrap text-sm font-semibold text-gray-600 hover:text-orange-600"
                                    >
                                        {label}
                                        {sortBy === option && (
                                            <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-orange-600 rounded-full"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="min-w-[220px] max-w-[240px]">
                                    <SkeletonLoader type="card" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
                            {filteredAndSorted.map((product, index) => (
                                <div
                                    key={`${product.product_id}-${index}`}
                                    ref={index === filteredAndSorted.length - 1 ? lastProductRef : null}
                                    className="min-w-[200px] max-w-[200px] snap-start"
                                >
                                    <ProductCard
                                        {...product}
                                        id={product.product_id}
                                        image={getImageUrl(product.product_image)}
                                        inStock={product.quantity > 0}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {isLoadingMore && (
                        <div className="py-20 flex justify-center">
                            <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
