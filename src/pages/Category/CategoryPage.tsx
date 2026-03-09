import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { productAPI } from '../../services/api';
import { productCache } from '../../services/productCache';
import ProductCard from '../../components/Product/ProductCard';
import ProductDetails from '../../components/Product/ProductDetails';
import { useNavigation } from "../../utils/navigation";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductSortDropdown from './ProductSortDropdown';
import SkeletonLoader from '../../components/UI/SkeletonLoader';


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

interface CategoryPageProps {
    onSearchChange: (query: string) => void;
}

export default function CategoryPage({ onSearchChange }: CategoryPageProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Get category from URL parameters
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');

        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, []);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-high' | 'price-low'>('newest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const { go } = useNavigation();


    // Ref for infinite scroll
    const observer = useRef<IntersectionObserver>();
    const lastProductRef = useRef<HTMLDivElement>(null);

    // Get search query from URL and listen for changes
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            const searchMatch = hash.match(/[?&]search=([^&]*)/);
            if (searchMatch) {
                const query = decodeURIComponent(searchMatch[1] || '');
                setSearchQuery(query);
            } else {
                setSearchQuery('');
            }
        };

        // Check initial hash
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        setProducts([]);
        setCurrentPage(1);
        setHasMore(true);

        if (selectedCategory) {
            const cacheKey = `category-${selectedCategory}-page-1-limit-12`;
            const cachedProducts = productCache.getCachedProducts(cacheKey);
            if (cachedProducts) {
                setProducts(cachedProducts);
                setHasMore(cachedProducts.length === 12);
                setCurrentPage(2);
            } else {
                loadProductsByCategory(selectedCategory, true);
            }
        } else {
            loadAllProducts(true);
        }
    }, [selectedCategory, searchQuery]);

    // Infinite scroll observer
    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoadingProducts && !isLoadingMore) {
                loadMoreProducts();
            }
        }, options);

        if (lastProductRef.current) {
            observer.current.observe(lastProductRef.current);
        }

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [hasMore, isLoadingProducts, isLoadingMore, currentPage, selectedCategory, searchQuery]);

    const loadAllProducts = async (reset: boolean = true) => {
        const page = reset ? 1 : currentPage;
        const cacheKey = `products-page-${page}-limit-12`;

        if (reset) {
            setIsLoadingProducts(true);
        } else {
            setIsLoadingMore(true);
        }

        try {
            // Check cache first
            const cachedProducts = productCache.getCachedProducts(cacheKey);
            if (cachedProducts && !reset) {
                // Load from cache for pagination
                if (reset) {
                    setProducts(cachedProducts);
                } else {
                    setProducts(prev => [...prev, ...cachedProducts]);
                }

                setHasMore(cachedProducts.length === 12);
                if (!reset) {
                    setCurrentPage(prev => prev + 1);
                } else {
                    setCurrentPage(2);
                }
                setIsLoadingMore(false);
                return;
            }

            const response = await productAPI.getProducts(page, 12);

            if (response.data.status === true && response.data.products && Array.isArray(response.data.products)) {
                // Cache the products
                productCache.setCachedProducts(cacheKey, response.data.products);

                if (reset) {
                    setProducts(response.data.products);
                } else {
                    setProducts(prev => [...prev, ...response.data.products]);
                }

                // Check if there are more products to load
                setHasMore(response.data.products.length === 12);
                if (!reset) {
                    setCurrentPage(prev => prev + 1);
                } else {
                    setCurrentPage(2);
                }
            } else {
                if (reset) {
                    setProducts([]);
                }
                setHasMore(false);
            }
        } catch (error: unknown) {
            console.error('❌ Error loading all products:', error);
            if (reset) {
                setProducts([]);
            }
            setHasMore(false);
        } finally {
            setIsLoadingProducts(false);
            setIsLoadingMore(false);
        }
    };

    const loadMoreProducts = async () => {
        if (selectedCategory) {
            loadProductsByCategory(selectedCategory, false);
        } else {
            loadAllProducts(false);
        }
    };

    const loadProductsByCategory = async (categoryName: string, reset: boolean = true) => {
        const page = reset ? 1 : currentPage;
        const cacheKey = `category-${categoryName}-page-${page}-limit-12`;

        if (reset) {
            setIsLoadingProducts(true);
        } else {
            setIsLoadingMore(true);
        }

        try {
            // Check cache first
            const cachedProducts = productCache.getCachedProducts(cacheKey);
            if (cachedProducts && (reset || !reset)) {
                // Load from cache for pagination
                if (reset) {
                    setProducts(cachedProducts);
                } else {
                    setProducts(prev => [...prev, ...cachedProducts]);
                }

                setHasMore(cachedProducts.length === 12);
                if (!reset) {
                    setCurrentPage(prev => prev + 1);
                } else {
                    setCurrentPage(2);
                }
                setIsLoadingMore(false);
                return;
            }

            const response = await productAPI.getProductByCategory(categoryName, page, 12);

            if (response.data.status === 'ok' && response.data.data) {
                const categoryData = response.data.data;
                if (categoryData && categoryData.Products && Array.isArray(categoryData.Products)) {
                    // Cache the products
                    productCache.setCachedProducts(cacheKey, categoryData.Products);

                    if (reset) {
                        setProducts(categoryData.Products);
                    } else {
                        setProducts(prev => [...prev, ...categoryData.Products]);
                    }

                    // Check if there are more products to load
                    setHasMore(categoryData.Products.length === 12);
                    if (!reset) {
                        setCurrentPage(prev => prev + 1);
                    } else {
                        setCurrentPage(2);
                    }
                } else {
                    if (reset) {
                        setProducts([]);
                    }
                    setHasMore(false);
                }
            } else {
                if (reset) {
                    setProducts([]);
                }
                setHasMore(false);
            }
        } catch (error: unknown) {
            console.error('❌ Error loading products:', error);
            if (reset) {
                setProducts([]);
            }
            setHasMore(false);
        } finally {
            setIsLoadingProducts(false);
            setIsLoadingMore(false);
        }
    };

    const getImageUrl = (productImage: string | string[] | { [key: string]: string } | undefined): string => {
        if (!productImage) return '';
        if (typeof productImage === 'string') {
            return productImage;
        }
        if (Array.isArray(productImage)) {
            return productImage[0] || '';
        }
        if (typeof productImage === 'object') {
            const values = Object.values(productImage);
            return values[0] || '';
        }
        return '';
    };

    const handleCategoryClick = () => {
        go('/category-list');
    };

    const handleProductClick = (productId: number) => {
        setSelectedProductId(productId);
    };

    // Sort and filter products based on selected sort option and search query
    const sortedProducts = useMemo(() => {
        let filtered = [...products];

        // Apply search filter if search query exists
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product => {
                const name = (product.name || product.title || '').toLowerCase();
                const category = product.Catagory?.name?.toLowerCase() || '';
                return name.includes(query) || category.includes(query);
            });
        }

        // Apply sorting
        switch (sortBy) {
            case 'newest':
                return filtered.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                });
            case 'oldest':
                return filtered.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateA - dateB;
                });
            case 'price-high':
                return filtered.sort((a, b) => {
                    const priceA = a.selling_price || a.price || 0;
                    const priceB = b.selling_price || b.price || 0;
                    return priceB - priceA;
                });
            case 'price-low':
                return filtered.sort((a, b) => {
                    const priceA = a.selling_price || a.price || 0;
                    const priceB = b.selling_price || b.price || 0;
                    return priceA - priceB;
                });
            default:
                return filtered;
        }
    }, [products, sortBy, searchQuery]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onSearchChange={onSearchChange} />

            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={handleCategoryClick}
                            className="flex items-center gap-2 text-gray-700 hover:text-amber-700 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium">Back</span>
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Categories</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Products Grid */}
                <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory ? `${selectedCategory} Products` : 'All Products'}
                        </h2>
                        <div className="flex items-center gap-4">
                            {products.length > 0 && (
                                <p className="text-gray-600 text-sm">
                                    {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
                                </p>
                            )}
                            {products.length > 0 && (
                                <ProductSortDropdown
                                    sortBy={sortBy}
                                    showDropdown={showSortDropdown}
                                    onSortChange={setSortBy}
                                    onToggleDropdown={() => setShowSortDropdown(!showSortDropdown)}
                                />
                            )}
                        </div>
                    </div>

                    {isLoadingProducts ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <SkeletonLoader key={index} type="card" />
                            ))}
                        </div>
                    ) : sortedProducts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg">
                            <p className="text-gray-600 text-lg">{searchQuery ? 'No products found for your search' : 'No Product Found'}</p>
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        window.location.hash = '#/categories';
                                    }}
                                    className="mt-4 px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop: Always grid view with smaller cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                {sortedProducts.map((product, index) => {
                                    const imageUrl = getImageUrl(product.product_image);
                                    return (
                                        <div
                                            key={product.product_id}
                                            ref={index === sortedProducts.length - 1 ? lastProductRef : null}
                                        >
                                            <ProductCard
                                                id={product.product_id}
                                                name={product.name || product.title || 'Product'}
                                                price={product.selling_price || product.price}
                                                image={imageUrl}
                                                category={product.Catagory?.name || selectedCategory || 'Product'}
                                                inStock={product.quantity > 0}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mobile: List view without Add to Cart button */}
                            <div className="sm:hidden space-y-3">
                                {sortedProducts.map((product, index) => {
                                    const imageUrl = getImageUrl(product.product_image);
                                    return (
                                        <div
                                            key={product.product_id}
                                            ref={index === sortedProducts.length - 1 ? lastProductRef : null}
                                            onClick={() => handleProductClick(product.product_id)}
                                            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl flex flex-row gap-3 p-3"
                                        >
                                            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                <img
                                                    src={imageUrl}
                                                    alt={product.name || 'Product'}
                                                    className="w-full h-full object-cover"
                                                />
                                                {(!product.quantity || product.quantity < 1) && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                                                            Out of Stock
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                                <div>
                                                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 hover:text-amber-700 transition-colors">
                                                        {product.name || product.title || 'Product'}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 mb-1">
                                                        {product.Catagory?.name || selectedCategory}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base font-bold text-amber-700">
                                                            ${product.selling_price || product.price}
                                                        </span>
                                                        {product.price > product.selling_price && (
                                                            <span className="text-xs text-gray-500 line-through">
                                                                ${product.price}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs font-semibold ${product.quantity && product.quantity >= 1
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                        }`}>
                                                        {product.quantity && product.quantity >= 1
                                                            ? 'In Stock'
                                                            : 'Out of Stock'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Loading More Indicator */}
                            {isLoadingMore && (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                                </div>
                            )}

                            {/* No More Products Indicator */}
                            {!hasMore && sortedProducts.length > 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-sm">You've reached the end of the collection</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Product Details Modal */}
            {selectedProductId && (
                <ProductDetails
                    productId={selectedProductId}
                    onClose={() => setSelectedProductId(null)}
                />
            )}

            <Footer />
        </div>
    );
}