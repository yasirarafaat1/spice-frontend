import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import OrderSuccess from './checkout/OrderSuccess';
import AddressSelector from '../components/AddressSelector';
import { userAPI } from '../services/api';
import { useAuthProtection } from '../utils/authProtection';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from "../utils/navigation";
import { loadScript } from '../utils/loadScript';

interface CheckoutPageProps {
  onBack?: () => void;
}

export default function CheckoutPage({ onBack }: CheckoutPageProps) {
  const { go } = useNavigation();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, buyNowItemId, setBuyNowItem } = useCart(); // Removed clearCart
  const location = useLocation();
  const { isLoading: authLoading } = useAuthProtection();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  // Removed PayU payment data state as PayU is no longer used
  // const [payuPaymentData, setPayuPaymentData] = useState<{ payuUrl: string; params: PayUParams } | null>(null);

  // Get buyNowItemId from location state if available
  const locationState = location.state as { buyNowItemId?: number } | null;
  const effectiveBuyNowItemId = locationState?.buyNowItemId || buyNowItemId;

  // Filter cart items if buyNowItemId is set
  const itemsToProcess = effectiveBuyNowItemId
    ? cartItems.filter(item => item.id === effectiveBuyNowItemId)
    : cartItems;

  const subtotal = itemsToProcess.reduce((total, item) => total + item.price * item.quantity, 0);

  // Clean up buyNowItemId when component unmounts
  useEffect(() => {
    // Only run cleanup if user is authenticated
    if (!isAuthenticated) return;

    return () => {
      if (effectiveBuyNowItemId) {
        setBuyNowItem(null);
      }
    };
  }, [effectiveBuyNowItemId, setBuyNowItem, isAuthenticated]);

  // Handle pending buy now item after login
  useEffect(() => {
    if (isAuthenticated) {
      // Check if there's a pending "Buy Now" operation
      const pendingBuyNow = localStorage.getItem('pendingBuyNow');
      if (pendingBuyNow && !buyNowItemId) {
        try {
          const productId = parseInt(pendingBuyNow);
          if (!isNaN(productId)) {
            // Set the buy now item ID
            setBuyNowItem(productId);
          }
        } catch (e) {
          console.error('Error parsing pendingBuyNow:', e);
        }

        // Clear the pending operation
        localStorage.removeItem('pendingBuyNow');
      }
    }
  }, [isAuthenticated, buyNowItemId, setBuyNowItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId) {
      alert('Please select a delivery address');
      return;
    }

    setIsProcessing(true);

    try {
      // Create items array from filtered cart items
      const items = itemsToProcess.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      // Create order with filtered items
      const response = await userAPI.createOrder({
        address_id: selectedAddressId!,
        items,
        email: user?.email
      });

      setIsProcessing(false);

      const { order, key, amount, currency } = response.data;
      // Load Razorpay script
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      const rzp = new (window as any).Razorpay({
        key,
        amount,
        currency,
        name: 'Pure Fire Masale',
        description: 'Order Payment',
        order_id: order?.id,
        handler: async function (payRes: any) {
          try {
            await userAPI.confirmPayment({
              razorpay_order_id: payRes.razorpay_order_id,
              razorpay_payment_id: payRes.razorpay_payment_id,
              razorpay_signature: payRes.razorpay_signature,
            });
            setOrderPlaced(true);
          } catch (err) {
            console.error(err);
            alert('Payment verified but order confirmation failed. Please contact support.');
          }
        },
        prefill: {
          email: user?.email || '',
        },
        theme: { color: '#f97316' },
      });
      rzp.on('payment.failed', function (response: any) {
        console.error(response.error);
        alert('Payment failed, please try again');
      });
      rzp.open();
    } catch (error) {
      console.error('Error creating order:', error);
      setIsProcessing(false);
      alert('Failed to create order. Please try again.');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = '/cart';
    }
  };

  const handleContinueShopping = () => {
    window.location.hash = '';
    if (onBack) {
      onBack();
    }
  };

  // Handle login button click - save current path before redirecting
  const handleLoginClick = () => {
    // Save the current path to redirect back after login
    localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
    go('/log');
  };

  // Show login message if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-black rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in</h2>
          <p className="text-white mb-6">You need to be logged in to proceed with checkout.</p>
          <button
            onClick={handleLoginClick}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return <OrderSuccess onContinueShopping={handleContinueShopping} clearCartOnSuccess={false} />;
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  // Show loading state while waiting for cart items to filter
  if (effectiveBuyNowItemId && cartItems.length > 0 && itemsToProcess.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (itemsToProcess.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-black rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Please add items to your cart before checkout.</p>
          <button
            onClick={handleBack}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-white hover:text-amber-700 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">
            {effectiveBuyNowItemId ? 'Back to Cart' : 'Back to Cart'}
          </span>
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form - Added preventDefault to form submission */}
          <div className="lg:col-span-2">
            <form onSubmit={(e) => {
              e.preventDefault(); // Prevent any accidental form submission
              handleSubmit(e);
            }} className="space-y-8">
              {/* Address Selection */}
              <div className="bg-black rounded-xl shadow-md p-6">
                <AddressSelector
                  selectedAddressId={selectedAddressId}
                  onAddressSelect={setSelectedAddressId}
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Place Order
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-black rounded-xl shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                {effectiveBuyNowItemId ? 'Order Summary (Single Item)' : 'Order Summary'}
              </h2>

              <div className="space-y-4 mb-6">
                {itemsToProcess.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <p className="text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-white">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Items</span>
                  <span className="font-semibold">{itemsToProcess.reduce((total, item) => total + item.quantity, 0)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-white">Total</span>
                  <span className="text-2xl font-bold text-amber-700">
                  ₹{subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
