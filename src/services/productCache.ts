// Product Cache Service - Prevents redundant API calls
import { Product } from '../utils/productUtils';

interface ProductSpecification {
  specification_id?: number;
  key?: string;
  value?: string;
}

interface ProductDetailData {
  product_id: number;
  name: string;
  title?: string;
  price: number;
  selling_price: number;
  product_image: string | string[] | { [key: string]: string };
  product_video?: string;
  quantity: number;
  description?: string;
  ProductSpecification?: ProductSpecification[];
  ProductSpecifications?: ProductSpecification[];
  catagory_id?: number;
}


interface ProductDetailCache {
  product: ProductDetailData;
  timestamp: number;
}

interface CachedData {
  products: Product[];
  timestamp: number;
  bestSellers: Product[];
  newArrivals: Product[];
}

interface ProductCache {
  [key: string]: CachedData;
}

interface LocalStorageData {
  cache: ProductCache;
  productDetailCache: { [key: number]: ProductDetailCache };
  timestamp: number;
}

class ProductCacheService {
  private cache: ProductCache = {};
  private productDetailCache: { [key: number]: ProductDetailCache } = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
  private readonly LOCAL_STORAGE_KEY = 'productCache';
  private readonly LOCAL_STORAGE_DURATION = 30 * 60 * 1000; // 30 minutes for local storage

  constructor() {
    this.loadFromLocalStorage();
  }

  // Load cache from local storage on initialization
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      
      if (stored) {
        const data: LocalStorageData = JSON.parse(stored);
        
        // Check if local storage data is still valid
        if (Date.now() - data.timestamp < this.LOCAL_STORAGE_DURATION) {
          this.cache = data.cache || {};
          this.productDetailCache = data.productDetailCache || {};
        } else {
          this.clearLocalStorage();
        }
      }
    } catch (error) {
      console.error('❌ Error loading from local storage:', error);
      this.clearLocalStorage();
    }
  }

  // Save cache to local storage
  private saveToLocalStorage(): void {
    try {
      const data: LocalStorageData = {
        cache: this.cache,
        productDetailCache: this.productDetailCache,
        timestamp: Date.now()
      };
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
    }
  }

  // Clear local storage
  private clearLocalStorage(): void {
    try {
      localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error('❌ Error clearing local storage:', error);
    }
  }

  // Generate cache key based on API endpoint and parameters
  private generateCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}${params ? JSON.stringify(params) : ''}`;
  }

  // Check if cache is valid (not expired)
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  // Get cached products
  getCachedProducts(endpoint: string, params?: any): Product[] | null {
    const key = this.generateCacheKey(endpoint, params);
    const cached = this.cache[key];

    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.products;
    }
    return null;
  }

  // Cache products with timestamp
  setCachedProducts(endpoint: string, products: Product[], params?: any): void {
    const key = this.generateCacheKey(endpoint, params);
    
    this.cache[key] = {
      products,
      timestamp: Date.now(),
      bestSellers: [],
      newArrivals: []
    };
    
    // Save to local storage
    this.saveToLocalStorage();
  }

  // Get cached bestsellers
  getCachedBestSellers(): Product[] | null {
    const cached = this.cache['bestsellers'];

    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.bestSellers;
    }
    return null;
  }

  // Cache bestsellers
  setCachedBestSellers(products: Product[]): void {
    this.cache['bestsellers'] = {
      products: [],
      bestSellers: products,
      newArrivals: [],
      timestamp: Date.now()
    };
    
    // Save to local storage
    this.saveToLocalStorage();
  }

  // Get cached new arrivals
  getCachedNewArrivals(): Product[] | null {
    const cached = this.cache['newarrivals'];

    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.newArrivals;
    }

    return null;
  }

  // Cache new arrivals
  setCachedNewArrivals(products: Product[]): void {
    this.cache['newarrivals'] = {
      products: [],
      bestSellers: [],
      newArrivals: products,
      timestamp: Date.now()
    };
    
    // Save to local storage
    this.saveToLocalStorage();
  }

  // Clear cache (for manual refresh or logout)
  clearCache(): void {
    this.cache = {};
    this.productDetailCache = {};
    this.clearLocalStorage();
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    Object.keys(this.cache).forEach(key => {
      if (!this.isCacheValid(this.cache[key].timestamp)) {
        delete this.cache[key];
      }
    });
    
    // Also clear expired product detail cache
    Object.keys(this.productDetailCache).forEach(key => {
      const productId = parseInt(key);
      if (!this.isCacheValid(this.productDetailCache[productId].timestamp)) {
        delete this.productDetailCache[productId];
      }
    });
    
    // Save updated cache to local storage
    this.saveToLocalStorage();
  }

  // Get cache stats for debugging
  getCacheStats(): { [key: string]: { count: number; age: number } } {
    const stats: { [key: string]: { count: number; age: number } } = {};

    Object.keys(this.cache).forEach(key => {
      const cached = this.cache[key];
      stats[key] = {
        count: cached.products.length || cached.bestSellers.length || cached.newArrivals.length,
        age: Math.floor((Date.now() - cached.timestamp) / 1000) // age in seconds
      };
    });

    return stats;
  }

  // Get cached product details
  getCachedProductDetails(productId: number): ProductDetailCache | null {
    const cached = this.productDetailCache[productId];

    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached;
    }
    return null;
  }

  // Cache product details (main content only)
  setCachedProductDetails(
    productId: number,
    product: ProductDetailData
  ): void {
    this.productDetailCache[productId] = {
      product,
      timestamp: Date.now()
    };
    
    // Save to local storage
    this.saveToLocalStorage();
  }

  // Clear product cache
  clearProductCache(productId?: number): void {
    if (productId) {
      delete this.productDetailCache[productId];
    } else {
      this.productDetailCache = {};
    }
    
    // Save updated cache to local storage
    this.saveToLocalStorage();
  }

  // Clear product detail cache (alias for clearProductCache)
  clearProductDetailCache(productId?: number): void {
    this.clearProductCache(productId);
  }

  // Get all cached products from local storage (for debugging)
  getAllCachedProducts(): Product[] {
    const allProducts: Product[] = [];
    
    Object.values(this.cache).forEach(cachedData => {
      if (cachedData.products && cachedData.products.length > 0) {
        allProducts.push(...cachedData.products);
      }
      if (cachedData.bestSellers && cachedData.bestSellers.length > 0) {
        allProducts.push(...cachedData.bestSellers);
      }
      if (cachedData.newArrivals && cachedData.newArrivals.length > 0) {
        allProducts.push(...cachedData.newArrivals);
      }
    });
    
    // Remove duplicates based on product_id
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.product_id === product.product_id)
    );
    
    return uniqueProducts;
  }

  // Check if local storage has any cached products
  hasLocalStorageData(): boolean {
    try {
      const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (stored) {
        const data: LocalStorageData = JSON.parse(stored);
        return Date.now() - data.timestamp < this.LOCAL_STORAGE_DURATION;
      }
    } catch (error) {
      console.error('❌ Error checking local storage:', error);
    }
    return false;
  }
}

// Export singleton instance
export const productCache = new ProductCacheService();
