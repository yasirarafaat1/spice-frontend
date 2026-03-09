import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/api';
import { productCache } from '../services/productCache';
import ProductImageGallery from '../components/Product/ProductImageGallery';
import ProductInfo from '../components/Product/ProductInfo';
import ProductActions from '../components/Product/ProductActions';
import ProductReviews from '../components/Product/ProductReviews';
import FullscreenGalleryModal from '../components/Product/FullscreenGalleryModal';
import { useNavigation } from "../utils/navigation";
import { Product } from '../utils/productUtils';
import ProductCard from '../components/Product/ProductCard';
import { getCategoryById } from '../data/categories';
import { getSortedMediaArray } from '../utils/mediaSortUtils';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { ArrowLeft, Flame, Share2 } from 'lucide-react';

// --- Interfaces ---
interface ProductSpecification {
    specification_id?: number;
    key?: string;
    value?: string;
}

interface ProductData {
    product_id: number;
    name: string;
    title?: string;
    price: number;
    selling_price: number;
    product_image: any; 
    product_video?: string;
    quantity: number;
    description?: string;
    ProductSpecification?: ProductSpecification[];
    ProductSpecifications?: ProductSpecification[];
    catagory_id?: number;
}

interface CategoryProductData {
    product_id: number;
    name: string;
    title?: string;
    price: number;
    selling_price: number;
    product_image: any;
    quantity: number;
    Catagory?: {
        id: number;
        name: string;
    };
}

interface ProductDetailsPageProps {
    productId: number;
    onBack?: () => void;
}

export default function ProductDetailsPage({ productId, onBack }: ProductDetailsPageProps) {
    const [product, setProduct] = useState<ProductData | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<CategoryProductData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingRelated, setIsLoadingRelated] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [addedToCart, setAddedToCart] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [isContentVisible, setIsContentVisible] = useState(false);
    const [isFullscreenGalleryOpen, setIsFullscreenGalleryOpen] = useState(false);
    const [fullscreenGalleryIndex, setFullscreenGalleryIndex] = useState(0);
    const [isSharing, setIsSharing] = useState(false);
    
    const { cartItems, addToCart, isInCart } = useCart();
    const { go } = useNavigation();

    // Load Main Product
    useEffect(() => {
        const loadProduct = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await productAPI.getProductById(productId);
                if (response.data.status === 200 && response.data.data?.[0]) {
                    const data = response.data.data[0];
                    setProduct(data);
                    setIsContentVisible(true);
                    
                    // Load Related & Reviews
                    if (data.catagory_id) loadRelatedProducts(data.catagory_id, data.product_id);
                    loadProductReviews(data.product_id);
                } else {
                    setError('Product not found');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load product');
            } finally {
                setIsLoading(false);
            }
        };

        loadProduct();
    }, [productId]);

    // Update Cart Status
    useEffect(() => {
        if (product) setAddedToCart(isInCart(product.product_id));
    }, [cartItems, product, isInCart]);

    const loadProductReviews = async (id: number) => {
        try {
            const res = await productAPI.getProductReviews(id);
            const reviews = res?.data?.reviews || [];
            if (Array.isArray(reviews) && reviews.length > 0) {
                setReviewCount(reviews.length);
                const total = reviews.reduce((acc: number, r: any) => acc + r.review_rate, 0);
                setAverageRating(total / reviews.length);
            }
        } catch (err) { console.error(err); }
    };

    const loadRelatedProducts = async (catId: number, currentId: number) => {
        setIsLoadingRelated(true);
        try {
            const category = getCategoryById(catId);
            if (category) {
                const res = await productAPI.getProductByCategory(category.name);
                if (res.data.data?.Products) {
                    setRelatedProducts(res.data.data.Products.filter((p: any) => p.product_id !== currentId).slice(0, 4));
                }
            }
        } finally { setIsLoadingRelated(false); }
    };

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product.product_id, {
            name: product.name || product.title || '',
            price: product.selling_price || product.price,
            image: getSortedMediaArray(product.product_image)[0]
        });
    };

    const handleBuyNow = () => {
        handleAddToCart();
        go('/checkout');
    };

    const handleShare = async () => {
        if (!product) return;
        const url = `${window.location.origin}/product/${product.product_id}`;
        const title = product.name || product.title || 'Product';
        const text = `Check out ${title}`;
        try {
            setIsSharing(true);
            if (navigator.share) {
                await navigator.share({ title, text, url });
            } else {
                await navigator.clipboard.writeText(url);
                alert('Link copied to clipboard');
            }
        } catch (err) {
            console.error('Share failed', err);
        } finally {
            setIsSharing(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto p-8 animate-pulse">
                <div className="h-8 w-48 bg-white/10 rounded mb-8" />
                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="aspect-square bg-white/5 rounded-3xl" />
                    <div className="space-y-6">
                        <div className="h-12 bg-white/5 rounded w-3/4" />
                        <div className="h-6 bg-white/5 rounded w-1/2" />
                        <div className="h-40 bg-white/5 rounded w-full" />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-100 selection:bg-orange-600/40">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
                {/* Back & Share Action Bar */}
                <div className="flex justify-between items-center mb-8">
                    <button onClick={() => (onBack ? onBack() : go('/'))} className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase">Back to Shop</span>
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="p-2 bg-white/5 rounded-full border border-white/10 hover:border-orange-500/50 transition-all disabled:opacity-60"
                        title="Share product"
                    >
                        <Share2 size={18} className="text-gray-400" />
                    </button>
                </div>

                {/* Main Product Section */}
                <div className={`transition-all duration-700 ${isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">
                        
                        {/* Left: Premium Gallery */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-orange-600/5 blur-3xl rounded-full opacity-50 pointer-events-none" />
                            <ProductImageGallery
                                images={getSortedMediaArray(product?.product_image)}
                                selectedImage={selectedImage}
                                onImageSelect={setSelectedImage}
                                productName={product?.name || ''}
                                onImageClick={(idx) => { setFullscreenGalleryIndex(idx); setIsFullscreenGalleryOpen(true); }}
                            />
                        </div>

                        {/* Right: Info & Actions */}
                        <div className="flex flex-col">
                            {product && (
                                <>
                                    <ProductInfo
                                        name={product.name}
                                        title={product.title}
                                        description={product.description}
                                        price={product.price}
                                        sellingPrice={product.selling_price}
                                        specifications={product.ProductSpecification || product.ProductSpecifications || []}
                                        quantity={product.quantity}
                                        product={product as any}
                                        averageRating={averageRating}
                                        reviewCount={reviewCount}
                                    />
                                    
                                    <div className="mt-auto pt-10">
                                        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
                                            <ProductActions
                                                quantity={product.quantity}
                                                onAddToCart={handleAddToCart}
                                                onBuyNow={handleBuyNow}
                                                addedToCart={addedToCart}
                                                onGoToCart={() => go('/cart')}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reviews Section with Dark Card */}
                <div className="mt-24 border-t border-white/5 pt-16">
                    <div className="bg-[#111111] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl">
                        <ProductReviews productId={productId} />
                    </div>
                </div>

                {/* Related Spices Section */}
                <div className="mt-24 pb-12">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <div className="flex items-center gap-2 text-orange-500 mb-2">
                                <Flame size={16} fill="currentColor" />
                                <span className="text-[10px] font-black tracking-[0.4em] uppercase">Hot Recommendations</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Related Blends</h2>
                        </div>
                    </div>

                    {isLoadingRelated ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-white/5 rounded-3xl animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {relatedProducts.map((p) => (
                                <ProductCard
                                    key={p.product_id}
                                    id={p.product_id}
                                    name={p.name || p.title || ''}
                                    price={p.selling_price || p.price}
                                    image={getSortedMediaArray(p.product_image)[0]}
                                    category={p.Catagory?.name || ''}
                                    inStock={p.quantity > 0}
                                    disableHover={false}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* Modal remains same but ensure its theme is dark */}
            {isFullscreenGalleryOpen && product && (
                <FullscreenGalleryModal
                    images={getSortedMediaArray(product.product_image)}
                    initialIndex={fullscreenGalleryIndex}
                    onClose={() => setIsFullscreenGalleryOpen(false)}
                    productName={product.name}
                />
            )}
        </div>
    );
}
