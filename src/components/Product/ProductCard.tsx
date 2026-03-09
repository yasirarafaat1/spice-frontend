import { ShoppingCart, ShoppingBag, Star, Crown, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import WishlistButton from './WishlistButton';
import { useNavigation } from "../../utils/navigation";
import SkeletonLoader from '../UI/SkeletonLoader';

interface ProductCardProps {
  id?: number;
  name?: string;
  price?: number;
  image?: string;
  category?: string;
  inStock?: boolean;
  badge?: 'new' | 'bestseller' | null;
  oldPrice?: number;
  disableHover?: boolean;
  averageRating?: number;
  isLoading?: boolean; // New prop to handle internal loading
}

export default function ProductCard({
  id, name, price, image, category, inStock, badge, oldPrice,
  averageRating = 0, isLoading = false
}: ProductCardProps) {
  const { addToCart, isInCart } = useCart();
  const { go } = useNavigation();

  // If loading, show the skeleton version of the card
  if (isLoading) {
    return <SkeletonLoader type="card" className="h-full w-full" />;
  }

  // Logic for price calculations (only if not loading)
  const discount = oldPrice && price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <div 
      className="group relative bg-black p-2 transition-all duration-500 border border-transparent hover:border-amber-100/50 h-full flex flex-col"
    >
      {/* Image Container */}
      <div 
        className="relative overflow-hidden bg-gray-50 cursor-pointer"
        onClick={() => id && go(`/product/${id}`)}
      >
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {badge === 'bestseller' && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-xl">
              <Crown size={12} className="text-amber-400 fill-amber-400" />
              Best Seller
            </span>
          )}
          {badge === 'new' && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
              <Sparkles size={12} fill="white" />
              New Arrival
            </span>
          )}
        </div>

        {discount > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-[11px] font-bold shadow-lg">
              -{discount}%
            </span>
          </div>
        )}

        <img
          src={image}
          alt={name}
          className="w-full h-[20vh] sm:h-[20vh] md:h-[30vh] lg:h-[40vh] object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {id && <WishlistButton product={{ product_id: id, name: name || '', price: price || 0, selling_price: price || 0, product_image: image || '', quantity: 0 }} />}
        </div>

        {!inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-3 px-3 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest opacity-80">{category}</span>
          <div className="flex items-center gap-1">
            <Star size={12} className={averageRating > 0 ? "fill-amber-400 text-amber-400" : "text-white"} />
            <span className="text-[11px] font-bold text-white">{averageRating > 0 ? averageRating.toFixed(1) : "New"}</span>
          </div>
        </div>

        <h3 
          className="text-base font-semibold text-white line-clamp-2 mb-4 cursor-pointer group-hover:text-amber-700 transition-colors leading-tight h-10"
          onClick={() => id && go(`/product/${id}`)}
        >
          {name}
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {oldPrice && (
              <span className="text-xs text-white line-through font-medium">₹{oldPrice}</span>
            )}
            <span className="text-xl font-black font-bold text-white">₹{price}</span>
          </div>
          
          <button
            onClick={() => id && inStock && addToCart(id, { name: name || '', price: price || 0, image: image || '' })}
            disabled={!inStock}
            className={`p-3 rounded-2xl transition-all duration-300 ${
              id && isInCart(id) 
              ? 'bg-green-100 text-green-600' 
              : 'bg-gray-900 text-white hover:bg-amber-700 hover:shadow-amber-200'
            } disabled:opacity-50 disabled:bg-gray-100`}
          >
            {id && isInCart(id) ? <ShoppingBag size={20} /> : <ShoppingCart size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}