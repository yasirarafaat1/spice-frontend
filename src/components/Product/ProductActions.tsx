import { ShoppingCart, ArrowRight, Zap, ShoppingBag } from 'lucide-react';

interface ProductActionsProps {
    quantity: number;
    onAddToCart: () => void;
    onBuyNow: () => void;
    addedToCart: boolean;
    onGoToCart: () => void;
}

export default function ProductActions({
    quantity,
    onAddToCart,
    onBuyNow,
    addedToCart,
    onGoToCart
}: ProductActionsProps) {
    const isOutOfStock = quantity === 0;

    return (
        <div className="flex flex-col gap-4 w-full pt-2">
            <div className="flex flex-col sm:flex-row items-stretch gap-4">
                {addedToCart ? (
                    // --- View Cart Button (When already added) ---
                    <button
                        onClick={onGoToCart}
                        className="flex-[1.5] bg-white text-black hover:bg-orange-500 hover:text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] active:scale-95"
                    >
                        <ShoppingBag size={20} />
                        View in Cart
                        <ArrowRight size={18} />
                    </button>
                ) : (
                    // --- Add to Cart Button ---
                    <button
                        onClick={onAddToCart}
                        disabled={isOutOfStock}
                        className={`flex-[1.5] py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 shadow-lg
                            ${isOutOfStock 
                                ? 'bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed' 
                                : 'bg-white text-black hover:bg-orange-500 hover:text-white border border-transparent'
                            }`}
                    >
                        <ShoppingCart size={20} />
                        {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                    </button>
                )}

                {/* --- Buy Now Button (Visible on all screens for better conversion) --- */}
                <button
                    onClick={onBuyNow}
                    disabled={isOutOfStock}
                    className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 shadow-xl
                        ${isOutOfStock 
                            ? 'bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed' 
                            : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-900/20'
                        }`}
                >
                    <Zap size={20} fill="currentColor" />
                    {isOutOfStock ? 'Restocking' : 'Buy Now'}
                </button>
            </div>

            {/* Hint text for trust */}
            {!isOutOfStock && (
                <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-[0.3em] opacity-50">
                    Express Shipping Available
                </p>
            )}
        </div>
    );
}