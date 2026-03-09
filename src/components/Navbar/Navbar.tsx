import { ShoppingCart, Search, X, ChevronDown,Heart, User, Package, Settings, LogOut, LogIn, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from "../../utils/navigation";
import { productAPI } from '../../services/api';
import SearchSuggestions from '../Search/SearchSuggestions';
import { Product } from '../../utils/productUtils';

interface NavbarProps {
  onSearchChange?: (query: string) => void;
}

// Sub-component Interfaces
interface DropdownItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface MobileLinkProps {
  label: string;
  onClick: () => void;
}

export default function Navbar({ onSearchChange }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const { getTotalItems } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const { go } = useNavigation();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsSearchActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // API Call
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const response = await productAPI.getProducts();
        if (response.data.status && Array.isArray(response.data.products)) {
          setAllProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadAllProducts();
  }, []);

  const getFilteredSuggestions = () => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return allProducts.filter((product) => {
      const name = (product.name || product.title || '').toLowerCase();
      const category = product.Catagory?.name?.toLowerCase() || '';
      return name.includes(query) || category.includes(query);
    }).slice(0, 5);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      go(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setIsSearchActive(false);
      setIsMobileSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
  };

  // const openMobileSearch = () => {
  //   setIsMenuOpen(false);
  //   setIsMobileSearchOpen(true);
  //   setShowSuggestions(true);
  //   setIsSearchActive(true);
  //   setTimeout(() => {
  //     const input = document.getElementById('mobile-search-input');
  //     input?.focus();
  //   }, 50);
  // };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
    setShowSuggestions(false);
    setIsSearchActive(false);
  };

  return (
    <>
      {/* <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white py-1.5 text-center text-[10px] uppercase tracking-[0.2em] font-black z-[70] relative">
        Free Shipping on Orders Above ₹499 • Pure & Authentic
      </div> */}

      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/90 backdrop-blur-lg border-b border-white/10 py-2" : "bg-[#0f0f0f] py-4"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center group cursor-pointer" onClick={() => go('/')}>
              <div className="relative">
                <div className="absolute -inset-1 bg-orange-600 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
                <img src="/logo.jpg" alt="Logo" className="relative h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border border-white/20" />
              </div>
              <div className="ml-3">
                <span className="block text-lg font-black tracking-tighter no-wrap text-white leading-none uppercase">Pure Fire</span>
                <span className="text-[10px] tracking-[0.3em] text-orange-500 font-bold uppercase">Masale</span>
              </div>
            </div>

            {/* Desktop Search */}
            <div
              className={`lg:flex items-center flex-1 justify-center px-4 transition-all ${isSearchActive ? 'max-w-5xl' : 'max-w-xl'}`}
              ref={searchContainerRef}
            >
              <div className="relative w-full">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Search premium spices..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                      setIsSearchActive(true);
                      onSearchChange?.(e.target.value);
                    }}
                    onFocus={() => {
                      setShowSuggestions(true);
                      setIsSearchActive(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setShowSuggestions(false);
                        setIsSearchActive(false);
                      }, 150);
                    }}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-full px-2 py-2.5 pl-12 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-gray-500 text-sm"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                </form>
                
                {showSuggestions && searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
                    <SearchSuggestions
                      suggestions={getFilteredSuggestions()}
                      onSelect={(id) => { go(`/product/${id}`); setShowSuggestions(false); setIsSearchActive(false); }}
                      searchQuery={searchQuery}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Icons Section */}
            <div className={`flex items-center gap-1 md:gap-3 ${isSearchActive ? 'hidden lg:flex' : ''}`}>
              <button onClick={() => go('/category-list')} className="hidden md:block text-[10px] font-black tracking-[0.2em] text-gray-400 hover:text-orange-500 transition-colors">
                SHOP ALL
              </button>

              <button
                onClick={() => go('/cart')}
                className={`${isMobileSearchOpen ? 'hidden' : ''} relative p-2 text-gray-400 hover:text-white transition-all`}
              >
                <ShoppingCart size={22} />
                {getTotalItems() > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#0f0f0f]">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="hidden md:block relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-white/10 hover:border-orange-500/50 transition-all bg-white/5"
                >
                  <div className="bg-orange-600/20 p-1.5 rounded-full">
                    <User size={18} className="text-orange-500" />
                  </div>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden z-50">
                    {isAuthenticated ? (
                      <>
                        <DropdownItem icon={<User size={16}/>} label="My Profile" onClick={() => { go('/profile'); setIsProfileDropdownOpen(false); }} />
                        <DropdownItem icon={<Package size={16}/>} label="My Orders" onClick={() => { go('/orders'); setIsProfileDropdownOpen(false); }} />
                        <DropdownItem icon={<Heart size={16}/>} label="My Wishlist" onClick={() => { go('/wishlist'); setIsProfileDropdownOpen(false); }} />
                        <DropdownItem icon={<Settings size={16}/>} label="Settings" onClick={() => { go('/settings'); setIsProfileDropdownOpen(false); }} />
                        <div className="h-px bg-white/5 my-1" />
                        <DropdownItem icon={<LogOut size={16}/>} label="Sign Out" onClick={handleLogout} color="text-red-500" />
                      </>
                    ) : (
                      <DropdownItem icon={<LogIn size={16}/>} label="Login / Register" onClick={() => { go('/log'); setIsProfileDropdownOpen(false); }} />
                    )}
                  </div>
                )}
              </div>

              {/* Mobile search only */}
              {/* <button
                className={`${isMobileSearchOpen ? 'hidden' : ''} lg:hidden p-2 text-white`}
                onClick={openMobileSearch}
              >
                <Search size={24} />
              </button> */}

              {/* Mobile Menu Button (hide when search open) */}
              <button
                className={`${isMobileSearchOpen || isSearchActive ? 'hidden' : ''} lg:hidden p-2 text-white`}
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu size={28} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] transition-opacity duration-300 lg:hidden ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsMenuOpen(false)} />
        <div className={`fixed top-0 right-0 h-full w-4/5 max-w-xs bg-[#0f0f0f] z-[101] p-8 transition-transform duration-500 ease-in-out lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex justify-between items-center mb-12">
              <div className="ml-3">
                <span className="block text-lg font-black tracking-tighter text-white leading-none uppercase">Pure Fire</span>
                <span className="text-[10px] tracking-[0.3em] text-orange-500 font-bold uppercase">Masale</span>
              </div>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 hover:text-white">
              <X size={32} />
            </button>
          </div>
          
          <div className="space-y-8">
            <MobileLink label="Home" onClick={() => { go('/'); setIsMenuOpen(false); }} />
            <MobileLink label="Collections" onClick={() => { go('/category-list'); setIsMenuOpen(false); }} />
            <MobileLink label="My Cart" onClick={() => { go('/cart'); setIsMenuOpen(false); }} />
            <div className="h-px" />
            {isAuthenticated ? (
               <MobileLink label="Logout" onClick={handleLogout} />
            ) : (
              <MobileLink label="Sign In" onClick={() => { go('/log'); setIsMenuOpen(false); }} />
            )}
          </div>
        </div>
      </nav>

      {/* Mobile full-screen search */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-lg px-4 py-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <button className="p-2 text-gray-400 hover:text-white" onClick={closeMobileSearch}>
              <X size={26} />
            </button>
            <span className="text-xs font-black tracking-[0.2em] text-white/50">SEARCH</span>
            <div className="w-8" />
          </div>

          <div className="relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit}>
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); onSearchChange?.(e.target.value); }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-12 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-gray-500 text-base"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </form>

            {showSuggestions && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-80 overflow-y-auto">
                <SearchSuggestions
                  suggestions={getFilteredSuggestions()}
                  onSelect={(id) => { go(`/product/${id}`); setShowSuggestions(false); closeMobileSearch(); }}
                  searchQuery={searchQuery}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Fixed Sub-components with TypeScript
function DropdownItem({ icon, label, onClick, color = "text-gray-300" }: DropdownItemProps) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors ${color}`}>
      {icon} {label}
    </button>
  );
}

function MobileLink({ label, onClick }: MobileLinkProps) {
  return (
    <button onClick={onClick} className="block w-full text-left text-3xl font-black tracking-tighter text-gray-400 hover:text-orange-500 transition-colors uppercase">
      {label}
    </button>
  );
}
