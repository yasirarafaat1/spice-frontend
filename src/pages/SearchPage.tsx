import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Flame, ShoppingBag, AlertCircle } from 'lucide-react';
import { productAPI } from '../services/api';
import { productCache } from '../services/productCache';
import ProductCard from '../components/Product/ProductCard';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { Product, getImageUrl, isProductNew, isProductBestSeller } from '../utils/productUtils';
import { useNavigation } from "../utils/navigation";
import SkeletonLoader from '../components/UI/SkeletonLoader';

interface SearchPageProps {
    onBack: () => void;
    onSearchChange: (query: string) => void;
}

export default function SearchPage({ onBack, onSearchChange }: SearchPageProps) {
    const { go } = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // 1. Fetch Suggestions (Initial Load)
    useEffect(() => {
        const loadAllProducts = async () => {
            try {
                const cached = productCache.getCachedProducts('all-products-suggestions');
                if (cached) {
                    setSuggestions(cached);
                    return;
                }
                const response = await productAPI.getProducts();
                const fetched = response.data?.products || response.data || [];
                if (Array.isArray(fetched)) {
                    productCache.setCachedProducts('all-products-suggestions', fetched);
                    setSuggestions(fetched);
                }
            } catch (error) {
                console.error('Error loading suggestions:', error);
            }
        };
        loadAllProducts();
    }, []);

    // 2. Optimized Search Logic
    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setProducts([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);
        const cacheKey = `search-${query.toLowerCase()}`;

        try {
            const cached = productCache.getCachedProducts(cacheKey);
            if (cached) {
                setProducts(cached);
                setIsLoading(false);
                return;
            }

            const response = await productAPI.searchProduct(query);
            let results: Product[] = [];

            // Robust data extraction
            if (response.data?.result) {
                const res = response.data.result;
                results = Array.isArray(res) ? res : (res.products || [res]);
            } else if (response.data?.products) {
                results = response.data.products;
            }

            // Fallback: Local Filtering
            if (results.length === 0) {
                const q = query.toLowerCase();
                results = suggestions.filter(p => 
                    (p.name || p.title || '').toLowerCase().includes(q) ||
                    (p.Catagory?.name || '').toLowerCase().includes(q)
                );
            }

            setProducts(results);
            if (results.length > 0) productCache.setCachedProducts(cacheKey, results);
        } catch (error) {
            console.error('Search failed:', error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [suggestions]);

    // 3. Sync with URL params
    useEffect(() => {
        const query = new URLSearchParams(window.location.search).get('q');
        if (query) {
            const decoded = decodeURIComponent(query);
            setSearchQuery(decoded);
            performSearch(decoded);
        }
    }, [window.location.search, performSearch]);

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar onSearchChange={onSearchChange} />

            {/* Header Sticky Bar */}
            <div className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/40 hover:text-orange-500 transition-all group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Back</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <Flame size={16} className="text-orange-600 animate-pulse" />
                        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-white/90">Search Center</h1>
                    </div>

                    <div className="w-10 md:w-20"></div> {/* Spacer */}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Result Info */}
                {hasSearched && !isLoading && (
                    <div className="mb-10">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-2">
                            Results for <span className="text-orange-600 italic">"{searchQuery}"</span>
                        </h2>
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
                            Found {products.length} Spices matching your heat level
                        </p>
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
                        {Array.from({ length: 10 }).map((_, i) => <SkeletonLoader key={i} type="card" />)}
                    </div>
                ) : hasSearched ? (
                    products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-[2rem] bg-white/[0.02]">
                            <div className="bg-orange-600/10 p-6 rounded-full mb-6">
                                <AlertCircle size={48} className="text-orange-600" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-widest mb-2">No Matches Found</h3>
                            <p className="text-white/40 text-sm max-w-xs text-center font-medium">
                                We couldn't find any products matching that keyword. Try something else?
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-12 md:gap-8">
                            {products.map((product) => {
                                const displayPrice = product.selling_price || product.price;
                                const oldPrice = product.price > product.selling_price ? product.price : undefined;
                                
                                return (
                                    <ProductCard
                                        key={product.product_id}
                                        id={product.product_id}
                                        name={product.name || product.title || 'Product'}
                                        price={displayPrice}
                                        image={getImageUrl(product.product_image)}
                                        category={product.Catagory?.name || 'Pure Fire'}
                                        inStock={product.quantity > 0}
                                        oldPrice={oldPrice}
                                        badge={isProductNew(product) ? 'new' : isProductBestSeller(product) ? 'bestseller' : null}
                                    />
                                );
                            })}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-40">
                        <ShoppingBag size={80} className="text-white/5 mb-6" />
                        <h3 className="text-white/20 font-black uppercase tracking-[0.5em]">Waiting for Input</h3>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}