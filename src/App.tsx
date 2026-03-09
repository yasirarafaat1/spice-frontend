// App.tsx
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import ProductGrid from './components/Product/ProductGrid';
import Footer from './components/Footer/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';
import SkeletonLoader from './components/UI/SkeletonLoader';

// Lazy load components for better performance
const LazyBestSellers = lazy(() => import('./components/BestSellers'));
const LazyNewArrivals = lazy(() => import('./components/NewArrivals'));

import AdminPage from './Admin/AdminPage';
import Features from './components/Features';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import ProfilePageTabs from './pages/ProfilePageTabs';
import CategoryPage from './pages/Category/CategoryPage';
import CategoryListPage from './pages/Category/CategoryListPage';
import ContactPage from './pages/ContactPage';
import ShippingInfoPage from './pages/ShippingInfoPage';
import ReturnsPage from './pages/ReturnsPage';
import FAQPage from './pages/FAQPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrderSuccess from './pages/checkout/OrderSuccess';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import SearchPage from './pages/SearchPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import MyOrdersPage from './pages/MyOrdersPage';
import WishlistPage from './pages/WishlistPage';
import SettingsPage from './pages/SettingsPage';

type HomeProps = { searchQuery: string; setSearchQuery: (q: string) => void };

function Home({ searchQuery, setSearchQuery }: HomeProps) {
  const [showBestSellers, setShowBestSellers] = useState(false);
  const [showNewArrivals, setShowNewArrivals] = useState(false);
  
  const bestSellersRef = useRef<HTMLDivElement>(null);
  const newArrivalsRef = useRef<HTMLDivElement>(null);

  // Sequential loading - Load BestSellers first, then trigger others
  useEffect(() => {
    // Load BestSellers immediately after mount
    const timer = setTimeout(() => {
      setShowBestSellers(true);
    }, 100); // Small delay for smooth UX

    return () => clearTimeout(timer);
  }, []);

  // Load NewArrivals after BestSellers is loaded
  useEffect(() => {
    if (showBestSellers) {
      const timer = setTimeout(() => {
        setShowNewArrivals(true);
      }, 800); // Load NewArrivals after 800ms

      return () => clearTimeout(timer);
    }
  }, [showBestSellers]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar onSearchChange={setSearchQuery} />
      <Hero />
      
      {/* Best Sellers - Lazy Loaded */}
      <div ref={bestSellersRef}>
        {!showBestSellers ? (
          <div className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <SkeletonLoader type="text" width="200px" height="32px" className="mb-4" />
                <SkeletonLoader type="text" width="400px" className="mx-auto" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonLoader key={i} type="card" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Suspense fallback={
            <div className="py-12 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                </div>
              </div>
            </div>
          }>
            <LazyBestSellers />
          </Suspense>
        )}
      </div>

      {/* New Arrivals - Lazy Loaded */}
      <div ref={newArrivalsRef}>
        {!showNewArrivals ? (
          <div className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <SkeletonLoader type="text" width="200px" height="32px" className="mb-4" />
                <SkeletonLoader type="text" width="400px" className="mx-auto" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonLoader key={i} type="card" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Suspense fallback={
            <div className="py-12 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                </div>
              </div>
            </div>
          }>
            <LazyNewArrivals />
          </Suspense>
        )}
      </div>

      <ProductGrid searchQuery={searchQuery} />

      <Features />
      
      <Footer />
    </div>
  );
}

function ProductRouteWrapper() {
  const { id } = useParams();
  const idNum = id ? parseInt(id, 10) : null;
  if (!idNum) {
    return <Navigate to="/" replace />;
  }
  return <ProductDetailsPage productId={idNum} />;
}

function OrderRouteWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  if (!id) return <Navigate to="/orders" replace />;
  return <OrderDetailsPage orderId={id} onBack={() => navigate('/orders')} />;
}

export default function App() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we should show the WhatsApp button
  // Don't show on admin panel or login page
  const shouldShowWhatsApp = !location.pathname.startsWith('/admin') &&
    location.pathname !== '/log' &&
    location.pathname !== '/auth/callback';

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />

        <Route
          path="/admin"
          element={
            <AdminPage onBack={() => navigate('/')} />
          }
        />

        <Route path="/cart" element={<CartPage onBack={() => navigate('/')} />} />
        <Route path="/checkout" element={<CheckoutPage onBack={() => navigate('/cart')} />} />
        <Route path="/log" element={<LoginPage onBack={() => navigate('/')} />} />
        <Route path="/auth/callback" element={<LoginPage onBack={() => navigate('/')} />} />
        <Route path="/profile" element={<ProfilePageTabs onBack={() => navigate('/')} />} />
        <Route path="/orders" element={<MyOrdersPage onBack={() => navigate('/profile')} />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/settings" element={<SettingsPage onBack={() => navigate('/profile')} />} />
        <Route path="/order-success" element={<OrderSuccess onContinueShopping={() => navigate('/')} />} />
        <Route path="/order/:id" element={<OrderRouteWrapper />} />
        <Route path="/product/:id" element={<ProductRouteWrapper />} />
        <Route path="/categories" element={<CategoryPage onSearchChange={setSearchQuery} />} />
        <Route path="/category-list" element={<CategoryListPage onSearchChange={setSearchQuery} onBack={() => navigate('/')} />} />
        <Route path="/search" element={<SearchPage onBack={() => navigate('/')} onSearchChange={setSearchQuery} />} />
        <Route path="/contact" element={<ContactPage onBack={() => navigate('/')} />} />
        <Route path="/shipping" element={<ShippingInfoPage onBack={() => navigate('/')} />} />
        <Route path="/returns" element={<ReturnsPage onBack={() => navigate('/')} />} />
        <Route path="/faq" element={<FAQPage onBack={() => navigate('/')} />} />
        <Route path="/privacy" element={<PrivacyPolicyPage onBack={() => navigate('/')} />} />
        <Route path="/terms" element={<TermsOfServicePage onBack={() => navigate('/')} />} />

        {/* Catch-all: redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* WhatsApp Button - shown on all pages except admin and login */}
      {shouldShowWhatsApp && (
        <WhatsAppButton
          phoneNumber="917317322775"
          message="Hi Pure Fire Masale, I came across your website and would like to discuss about products."
          position="right"
        />
      )}
    </>
  );
}