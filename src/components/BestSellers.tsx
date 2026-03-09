import { useState, useEffect, useCallback } from 'react';
import { Sparkles, ArrowRight, ShoppingBag, Star, Crown } from 'lucide-react';
import { productAPI } from '../services/api';
import { productCache } from '../services/productCache';
import { Product, getImageUrl } from '../utils/productUtils';
import { useNavigation } from "../utils/navigation";
import SkeletonLoader from './UI/SkeletonLoader';

interface Review {
  id: number;
  review_rate: number;
}

interface ProductWithRating extends Product {
  averageRating?: number;
  reviewCount?: number;
}

export default function BestSellers() {
  const [products, setProducts] = useState<ProductWithRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const { go } = useNavigation();
  const [ratingsCache, setRatingsCache] = useState<Record<number, { averageRating: number; reviewCount: number }>>({});

  const fetchFreshProducts = async () => {
    try {
      const response = await productAPI.getProducts();
      if (response.data.status && Array.isArray(response.data.products)) {
        const allProducts = response.data.products
          .sort((a: Product, b: Product) => {
            const aScore = (a.quantity || 0) + (a.selling_price || a.price || 0);
            const bScore = (b.quantity || 0) + (b.selling_price || b.price || 0);
            return bScore - aScore;
          })
          .slice(0, 4);

        productCache.setCachedBestSellers(allProducts);
        setProducts(allProducts);
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    const cached = productCache.getCachedBestSellers();
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
      const averageRating = reviewCount > 0 ? list.reduce((sum: number, r: Review) => sum + Number(r.review_rate), 0) / reviewCount : 0;
      setRatingsCache(prev => ({ ...prev, [productId]: { averageRating, reviewCount } }));
    } catch { /* Fail silently */ }
  }, [ratingsCache]);

  useEffect(() => {
    if (products.length > 0 && !isLoading) {
      products.forEach(p => fetchProductRating(p.product_id));
    }
  }, [products, fetchProductRating, isLoading]);

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="bg-[#050505] py-24 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4">
              <Crown size={14} className="animate-bounce" />
              <span>Elite Selection</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
              Best <span className="text-amber-500 italic">Sellers</span>
            </h2>
          </div>
          <button
            onClick={() => go('/categories')}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all border border-white/10 px-6 py-3 rounded-full hover:bg-white/5"
          >
            Explore the Vault
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform text-amber-500" />
          </button>
        </div>

        {/* Product Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 transition-all duration-1000 ${isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonLoader key={i} type="card" />)
          ) : (
            products.map((product) => {
              const imageUrl = getImageUrl(product.product_image);
              const ratingData = ratingsCache[product.product_id];
              const isSoldOut = product.quantity === 0;

              return (
                <div
                  key={product.product_id}
                  onClick={() => go(`/product/${product.product_id}`)}
                  className="group relative flex flex-col h-full"
                >
                  {/* Image Container with Custom Shape */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.02] rounded-[2.5rem] border border-white/5 group-hover:border-amber-500/30 transition-all duration-700">
                    
                    {/* Floating Badge */}
                    <div className="absolute top-5 left-5 z-20">
                      <div className="bg-black/60 backdrop-blur-xl border border-amber-500/20 px-3 py-1.5 rounded-2xl flex items-center gap-2">
                        <Sparkles size={10} className="text-amber-500 fill-amber-500" />
                        <span className="text-white text-[9px] font-black uppercase tracking-tighter">Trending Now</span>
                      </div>
                    </div>

                    <img
                      src={imageUrl}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${isSoldOut ? 'opacity-40 grayscale' : ''}`}
                    />

                    {/* Dark Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 opacity-80" />

                    {/* Action Overlay */}
                    {!isSoldOut && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="bg-amber-500 text-black p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(245,158,11,0.3)] transform translate-y-10 group-hover:translate-y-0 transition-transform">
                          <ShoppingBag size={24} strokeWidth={2.5} />
                        </div>
                      </div>
                    )}

                    {isSoldOut && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/40 border border-white/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                          Gone
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="pt-6 flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={10} 
                            fill={i < Math.floor(ratingData?.averageRating || 0) ? "currentColor" : "none"} 
                            className={i < Math.floor(ratingData?.averageRating || 0) ? "opacity-100" : "opacity-20 text-white"}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">
                        ({ratingData?.reviewCount || 0})
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1 group-hover:text-amber-500 transition-colors px-4">
                      {product.name || product.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xl font-black text-white">
                        ₹{product.selling_price || product.price}
                      </span>
                      {product.price > (product.selling_price || 0) && (
                        <span className="text-xs text-white/30 line-through">
                          ₹{product.price}
                        </span>
                      )}
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
