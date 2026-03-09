import { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, SortAsc, Flame, Filter } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/Product/ProductCard';
import { productAPI } from '../../services/api';
import { productCache } from '../../services/productCache';
import { useNavigation } from "../../utils/navigation";
import SkeletonLoader from '../../components/UI/SkeletonLoader';

interface CategoryItem {
    id: number | string;
    name: string;
}

interface CategoryListPageProps {
    onBack?: () => void;
    onSearchChange: (query: string) => void;
}

interface Product {
    product_id: number;
    name: string;
    title?: string;
    price: number;
    selling_price: number;
    product_image: string | string[] | { [key: string]: string };
    quantity: number;
    createdAt?: string;
    Catagory?: {
        id: number;
        name: string;
    };
}

export default function CategoryListPage({ onBack, onSearchChange }: CategoryListPageProps) {
    const { go } = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'name'>("featured");
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // 1. Load categories
    useEffect(() => {
        const loadCats = async () => {
            try {
                const res = await productAPI.getCategories();
                const apiCats = res.data?.categories?.map((c: any, idx: number) => ({
                    id: c._id || idx,
                    name: c.name,
                })) || [];
                setCategories(apiCats);
            } catch (err) {
                console.error('Failed to load categories', err);
                setCategories([]);
            }
        };
        loadCats();
    }, []);

    // 2. Fetch Products Logic (Fixed Callback & Dependencies)
    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            let fetchedProducts: Product[] = [];
            const cacheKey = selectedCategory === "All" 
                ? `products-page-1-limit-12` 
                : `category-${selectedCategory}-page-1-limit-12`;

            const cached = productCache.getCachedProducts(cacheKey);
            if (cached) {
                setProducts(cached);
                setIsLoading(false);
                return;
            }

            if (selectedCategory === "All") {
                const response = await productAPI.getProducts(1, 12);
                fetchedProducts = response.data?.products || response.data?.data?.Products || [];
            } else {
                const response = await productAPI.getProductByCategory(selectedCategory, 1, 12);
                fetchedProducts = response.data?.data?.Products || response.data?.products || [];
            }

            if (Array.isArray(fetchedProducts)) {
                productCache.setCachedProducts(cacheKey, fetchedProducts);
                setProducts(fetchedProducts);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory]); // Essential dependency added

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // 3. Helpers & Sorting
    const getImageUrl = (productImage: any): string => {
        if (!productImage) return '';
        if (typeof productImage === 'string') return productImage;
        if (Array.isArray(productImage)) return productImage[0] || '';
        if (typeof productImage === 'object') return Object.values(productImage)[0] as string || '';
        return '';
    };

    const sortedProducts = useMemo(() => {
        const sorted = [...products];
        switch (sortBy) {
            case 'price-low': return sorted.sort((a, b) => (a.selling_price || a.price) - (b.selling_price || b.price));
            case 'price-high': return sorted.sort((a, b) => (b.selling_price || b.price) - (a.selling_price || a.price));
            case 'name': return sorted.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
            default: return sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        }
    }, [products, sortBy]);

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <Navbar onSearchChange={onSearchChange} />

            {/* Sub-Header */}
            <div className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1440px] mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => onBack ? onBack() : go('/')}
                        className="flex items-center gap-2 text-white/50 hover:text-orange-500 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit to Store</span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:border-orange-500/50 transition-all"
                        >
                            <SortAsc size={16} className="text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{sortBy.replace('-', ' ')}</span>
                        </button>

                        {showSortDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                {['featured', 'price-low', 'price-high', 'name'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => { setSortBy(option as any); setShowSortDropdown(false); }}
                                        className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${sortBy === option ? 'text-orange-500 bg-orange-500/5' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {option.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row px-4 md:px-8 py-10 gap-10">
                {/* Desktop Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="lg:sticky lg:top-32 space-y-8">
                        <div>
                            <h3 className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-8">
                                <Filter size={14} className="text-orange-500" /> Catalog
                            </h3>
                            <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-4 lg:pb-0">
                                {[{ id: 'all', name: "All" }, ...categories].map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={`text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all flex-shrink-0 lg:flex-shrink
                                            ${selectedCategory === cat.name 
                                                ? 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)]' 
                                                : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <header className="mb-12">
                        <div className="flex items-center gap-2 text-orange-500 mb-2">
                            <Flame size={16} className="fill-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Fire Selection</span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter leading-none">
                            {selectedCategory} <span className="text-orange-600 italic">Vault</span>
                        </h1>
                        <p className="text-white/30 text-xs font-bold uppercase mt-4 tracking-widest">
                            Showing {sortedProducts.length} premium essentials
                        </p>
                    </header>

                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
                            {Array.from({ length: 6 }).map((_, i) => <SkeletonLoader key={i} type="card" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-x-4 gap-y-12 md:gap-8">
                            {sortedProducts.map((product) => (
                                <ProductCard
                                    key={product.product_id}
                                    id={product.product_id}
                                    name={product.name || product.title || 'Product'}
                                    price={product.selling_price || product.price}
                                    image={getImageUrl(product.product_image)}
                                    category={product.Catagory?.name || selectedCategory}
                                    inStock={product.quantity > 0}
                                />
                            ))}
                        </div>
                    )}

                    {!isLoading && sortedProducts.length === 0 && (
                        <div className="text-center py-40 border border-dashed border-white/10 rounded-3xl">
                            <p className="text-white/20 font-black uppercase tracking-widest">No stock found in this vault</p>
                        </div>
                    )}
                </main>
            </div>

            <Footer />
        </div>
    );
}
