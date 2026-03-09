import { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { productAPI } from '../../services/api';
import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';
import ProductActions from './ProductActions';
import ProductReviews from './ProductReviews';
import WishlistButton from './WishlistButton';
import { useNavigation } from "../../utils/navigation";
import { Product } from '../../utils/productUtils';
import ProductCard from './ProductCard';

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
  product_image: string | string[] | { [key: string]: string };
  quantity: number;
  description?: string;
  ProductSpecification?: ProductSpecification[];
  ProductSpecifications?: ProductSpecification[]; // Sequelize might return plural
}

interface ProductDetailsProps {
  productId: number;
  onClose: () => void;
}

export default function ProductDetails({ productId, onClose }: ProductDetailsProps) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  const { cartItems, addToCart, isInCart } = useCart(); // Add cartItems to the destructuring
  const { go } = useNavigation();

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Add effect to update addedToCart when cart changes
  useEffect(() => {
    if (product) {
      setAddedToCart(isInCart(product.product_id));
    }
  }, [cartItems, product, isInCart]);

  const loadProduct = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await productAPI.getProductById(productId);

      if (response.data.status === 200 && response.data.data && response.data.data.length > 0) {
        const p = response.data.data[0];
        setProduct(p);
        fetchRelatedProducts(p);
      } else {
        setError('Product not found');
      }
    } catch (error: unknown) {
      console.error('❌ Error loading product:', error);
      const err = error as {
        response?: {
          status?: number;
          data?: { message?: string };
        };
        message?: string;
      };
      setError(err.response?.data?.message || err.message || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedProducts = async (p: ProductData) => {
    try {
      const categoryName = p.Catagory?.name || 'All Products';
      let rel: Product[] = [];
      if (categoryName && categoryName !== 'All Products') {
        const resCat = await productAPI.getProductByCategory(categoryName, 1, 8);
        rel = resCat.data?.products || resCat.data?.data?.Products || [];
      }
      if ((!rel || rel.length === 0) && p.name) {
        const resSearch = await productAPI.searchProduct(p.name.split(' ')[0] || p.name, undefined, 1, 8);
        rel = resSearch.data?.products || [];
      }
      // final fallback: any products
      if (!rel || rel.length === 0) {
        const resAll = await productAPI.getProducts(1, 8);
        rel = resAll.data?.products || [];
      }
      let filtered = (rel || []).filter((item: Product) => item.product_id !== p.product_id);
      // if still empty, fetch another page
      if (filtered.length === 0) {
        const resMore = await productAPI.getProducts(2, 8);
        const more = resMore.data?.products || [];
        filtered = more.filter((item: Product) => item.product_id !== p.product_id);
      }
      setRelated(filtered.slice(0, 8));
    } catch (err) {
      console.error('Failed to load related products', err);
      setRelated([]);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      // Pass product data to addToCart
      addToCart(product.product_id, {
        name: product.name || product.title || 'Product',
        price: product.selling_price || product.price,
        image: Array.isArray(product.product_image)
          ? product.product_image[0]
          : typeof product.product_image === 'string'
            ? product.product_image
            : Object.values(product.product_image)[0] || ''
      });
      setAddedToCart(true);
    }
  };



  const getImageArray = (productImage: string | string[] | { [key: string]: string } | undefined): string[] => {
    if (!productImage) return [];
    if (typeof productImage === 'string') {
      return [productImage];
    }
    if (Array.isArray(productImage)) {
      return productImage;
    }
    if (typeof productImage === 'object') {
      return Object.values(productImage);
    }
    return [];
  };



  const handleGoToCart = () => {
    onClose();
    go('/cart');
  };

  const handleBuyNow = () => {
    if (product) {
      // Add to cart first
      addToCart(product.product_id, {
        name: product.name || product.title || 'Product',
        price: product.selling_price || product.price,
        image: Array.isArray(product.product_image)
          ? product.product_image[0]
          : typeof product.product_image === 'string'
            ? product.product_image
            : Object.values(product.product_image)[0] || ''
      });

      // Then navigate to checkout
      onClose();
      go('/checkout');
    }
  };

  const handleShare = async () => {
    if (!product) return;
    const url = `${window.location.origin}/product/${product.product_id}`;
    const title = product.name || product.title || 'Product';
    const text = `Check out ${title}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard');
      }
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={onClose}
            className="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const images = getImageArray(product.product_image);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-2 sm:py-4 lg:py-8 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-amber-700 transition-colors"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base font-medium">Back to Products</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 p-4 sm:p-6 lg:p-8 xl:p-12">
            <ProductImageGallery
              images={images}
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
              productName={product.name || product.title || 'Product'}
            />

            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <ProductInfo
                name={product.name || product.title || 'Product'}
                title={product.title}
                description={product.description}
                price={product.price}
                sellingPrice={product.selling_price}
                specifications={product.ProductSpecification || product.ProductSpecifications || []}
                quantity={product.quantity}
              />

              {/* Wishlist Button */}
              <div className="flex justify-end">
                <WishlistButton
                  product={product as Product}
                  size="lg"
                  showLabel={true}
                />
              </div>

              <ProductActions
                quantity={product.quantity}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                addedToCart={addedToCart}
                onGoToCart={handleGoToCart}
              />
              <div className="flex justify-center">
                <button
                  onClick={handleShare}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors"
                >
                  Share this product
                </button>
              </div>
            </div>

            {/* Related products */}
            {related.length > 0 && (
              <div className="mt-10 lg:col-span-2">
                <h3 className="text-xl font-black text-gray-900 mb-4">Related Products</h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {related.map((rp) => (
                    <div key={rp.product_id} className="min-w-[200px] max-w-[220px]">
                      <ProductCard
                        id={rp.product_id}
                        name={rp.name || rp.title || 'Product'}
                        price={rp.selling_price || rp.price}
                        image={Array.isArray(rp.product_image) ? rp.product_image[0] : typeof rp.product_image === 'string' ? rp.product_image : Object.values(rp.product_image || {})[0] || ''}
                        category={rp.Catagory?.name || ''}
                        inStock={rp.quantity > 0}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Reviews Section */}
            <div className="mt-8">
              <ProductReviews productId={product.product_id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
