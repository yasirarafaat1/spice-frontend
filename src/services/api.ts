import axios from 'axios';
import { getFriendlyErrorMessage } from '../utils/errorHandler';

// const API_BASE_URL = "https://islamicdecotweb.onrender.com";
// const API_BASE_URL = "https://backend.kiswahmakkahstore.com";
const API_BASE_URL = "https://spice-backend-9jml.onrender.com";
// const API_BASE_URL = "http://localhost:8080";
// 

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies if backend sets httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (debugging)
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor (handle auth errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url, error.message);
    
    // Auto-logout on 401 Unauthorized (session expired)
    if (error.response?.status === 401) {
      
      // Clear auth data
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('redirectAfterLogin');
      
      // Redirect to login page
      if (window.location.pathname !== '/log') {
        localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
        window.location.href = '/log';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API - OTP only
export const authAPI = {
  // Send OTP to email (also used for "resend")
  sendOtp: (email: string) => api.post('/api/auth/log', { email }).catch((error: unknown) => {
    console.error('sendOtp failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),

  // Verify OTP code
  verifyOtp: (email: string, otp: string) => api.post('/api/auth/varify-email', { email, otp }).catch((error: unknown) => {
    console.error('verifyOtp failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),
};

// User API
export const userAPI = {
  getProfile: (email?: string) =>
    api.post('/user/get-user-profile', { email }, { withCredentials: true }).catch((error: unknown) => {
      console.error('getProfile failed:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  updateProfile: (data: { name?: string; email?: string }) =>
    api.post('/user/update-user-profile', data, { withCredentials: true }).catch((error: unknown) => {
      console.error('updateProfile failed:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  getWishlist: (email: string) =>
    api.post('/user/wishlist/list', { email }, { withCredentials: true }).catch((error: unknown) => {
      console.error('getWishlist failed:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  addWishlist: (email: string, product_id: number) =>
    api.post('/user/wishlist/add', { email, product_id }, { withCredentials: true }).catch((error: unknown) => {
      console.error('addWishlist failed:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  removeWishlist: (email: string, product_id: number) =>
    api.post('/user/wishlist/remove', { email, product_id }, { withCredentials: true }).catch((error: unknown) => {
      console.error('removeWishlist failed:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  clearWishlist: (email: string) =>
    api.post('/user/wishlist/clear', { email }, { withCredentials: true }).catch((error: unknown) => {
      console.error('clearWishlist failed:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  getOrders: () =>
    api.post('/user/get-orders', {}, { withCredentials: true }).catch((error: unknown) => {
      console.error('getOrders failed:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  getAddresses: () =>
    api.post('/user/get-user-addresess', {}, { withCredentials: true }).catch((error: unknown) => {
      console.error('getAddresses failed:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  getCart: () =>
    api.post('/user/get-user-cart', {}, { withCredentials: true }).catch((error) => {
      console.error('getCart failed:', error);
      if (error.response?.status === 404) {
        throw new Error('Cart endpoint not available. Using localStorage only.');
      }
      if (error.response?.status === 403) {
        throw new Error('Authentication required for cart. Using localStorage only.');
      }
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load cart';
      throw new Error(message);
    }),

  saveCart: (cartItems: Array<Record<string, unknown>>) =>
    api.post('/user/save-cart', { cartItems }, { withCredentials: true }).catch((error: unknown) => {
      console.error('saveCart failed:', error);
      // @ts-expect-error - We're checking for the existence of response property
      if (error.response?.status === 404) {
        throw new Error('Save cart endpoint not available. Cart saved to localStorage only.');
      }
      // @ts-expect-error - We're checking for the existence of response property
      if (error.response?.status === 403) {
        throw new Error('Authentication required to save cart. Cart saved to localStorage only.');
      }
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  addToCart: (productId: number, quantity: number) =>
    api.post('/user/add-to-cart', { product_id: productId, quantity }, { withCredentials: true }).catch((error: unknown) => {
      console.error('addToCart failed:', error);
      // @ts-expect-error - We're checking for the existence of response property
      if (error.response?.status === 404) {
        throw new Error('Add to cart endpoint not available.');
      }
      // @ts-expect-error - We're checking for the existence of response property
      if (error.response?.status === 403) {
        throw new Error('Authentication required to add to cart.');
      }
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  removeFromCart: (productId: number) =>
    api.get(`/user/remove-cart-by-product/${productId}`, { withCredentials: true }).catch((error: unknown) => {
      console.error('removeFromCart failed:', error);
      // @ts-expect-error - We're checking for the existence of response property
      if (error.response?.status === 404) {
        throw new Error('Remove from cart endpoint not available.');
      }
      // @ts-expect-error - We're checking for the existence of response property
      if (error.response?.status === 403) {
        throw new Error('Authentication required to remove from cart.');
      }
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  updateCartItem: (productId: number, quantity: number) =>
    api.post('/user/update-cart-item', { product_id: productId, quantity }, { withCredentials: true }).catch((error: unknown) => {
      console.error('updateCartItem failed:', error);
      // @ts-expect-error - We're checking for the existence of response property
      if (error.response?.status === 404) {
        throw new Error('Update cart item endpoint not available.');
      }
      // @ts-expect-error - We're checking for the existence of response property
      if (error.response?.status === 403) {
        throw new Error('Authentication required to update cart item.');
      }
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  clearCart: () =>
    api.post('/user/clear-cart', {}, { withCredentials: true }).catch((error: unknown) => {
      console.error('clearCart failed:', error);
      // @ts-expect-error - We're checking for the existence of response property
      if (error.response?.status === 404) {
        throw new Error('Clear cart endpoint not available.');
      }
      // @ts-expect-error - We're checking for the existence of response property
      if (error.response?.status === 403) {
        throw new Error('Authentication required to clear cart.');
      }
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  createAddress: async (address: unknown) => {
    try {
      const response = await api.post('/user/create-newAddress', address);
      return response;
    } catch (error: unknown) {
      console.error('Error creating address:', error);
      const message = getFriendlyErrorMessage(error);
      // Special handling for phone number conflicts
      if (message.includes('phone') &&
        (message.includes('already') ||
          message.includes('exist') ||
          message.includes('unique'))) {
        throw new Error('An address with this phone number already exists.');
      } else {
        throw new Error(message);
      }
    }
  },

  updateAddress: async (addressId: number, address: Record<string, unknown>) => {
    try {
      const response = await api.patch('/user/update-user-address', { address_id: addressId, ...address });
      return response;
    } catch (error: unknown) {
      console.error('Error updating address:', error);
      const message = getFriendlyErrorMessage(error);
      // Special handling for phone number conflicts
      if (message.includes('phone') &&
        (message.includes('already') ||
          message.includes('exist') ||
          message.includes('unique'))) {
        throw new Error('An address with this phone number already exists.');
      } else {
        throw new Error(message);
      }
    }
  },

  createOrder: async (orderData: { address_id: number; items: Array<{ product_id: number; quantity: number }>; email?: string }) => {
    const user = localStorage.getItem('user');
    let userId = null;
    if (user) {
      try {
        const userData = JSON.parse(user);
        userId = userData.id;
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    try {
      const response = await api.post('/user/create-order', {
        ...orderData,
        decode_user: userId
      }, {
        withCredentials: true
      });

      return response;
    } catch (error: unknown) {
      console.error('Error creating order:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }
  },

  cancelOrder: (orderId: string) => api.post("/user/cancel-order", { order_id: orderId }).catch((error: unknown) => {
    console.error('cancelOrder failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),

  confirmPayment: async (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    api.post('/user/payment-success', payload).catch((error: unknown) => {
      console.error('confirmPayment failed:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),
};

// Product API
export const productAPI = {
  getProducts: (page: number = 1, limit: number = 12) => api.get(`/user/show-product?page=${page}&limit=${limit}`).catch((error: unknown) => {
    console.error('getProducts failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),

  getProductById: (id: number) => api.get(`/user/get-product-byid/${id}`).catch((error: unknown) => {
    console.error('getProductById failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),

  getProductByCategory: (category: string, page: number = 1, limit: number = 12) => api.get(`/user/get-product-byCategory/${category}?page=${page}&limit=${limit}`).catch((error: unknown) => {
    console.error('getProductByCategory failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),

  searchProduct: (search: string, price?: number, page: number = 1, limit: number = 12) => api.post('/user/search', { search, price, page, limit }).catch((error: unknown) => {
    console.error('searchProduct failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),

  getCategories: () => api.get('/user/get-categories').catch((error: unknown) => {
    console.error('getCategories failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),

  // Review APIs
  addProductReview: (reviewData: FormData) => api.post('/user/product-reviews', reviewData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).catch((error: unknown) => {
    console.error('addProductReview failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),

  getProductReviews: (productId: number) => api.get(`/user/get-product-reviews/${productId}`).catch((error: unknown) => {
    console.error('getProductReviews failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),
};

// Admin API
export const adminAPI = {
  login: (userName: string, password: string) => api.post('/admin/login', { userName, password }).catch((error: unknown) => {
    console.error('adminLogin failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),

  addCategory: (name: string) => api.post('/admin/add-catagory', { name }).catch((error: unknown) => {
    console.error('addCategory failed:', error);
    // treat 409 as success (already exists)
    if (error.response?.status === 409 && error.response?.data?.category) {
      return { data: error.response.data };
    }
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),

  uploadProduct: (formData: FormData) => api.post('/admin/upload-product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).catch((error: unknown) => {
    console.error('uploadProduct failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),

  getProducts: () => api.get('/admin/get-products').catch((error: unknown) => {
    console.error('adminGetProducts failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),

  updateProduct: (productId: number, data: { price?: number; selling_price?: number; quantity?: number }) =>
    api.patch(`/admin/update-product/${productId}`, data).catch((error: unknown) => {
      console.error('updateProduct failed:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  updateFullProduct: (productId: number, formData: FormData) =>
    api.patch(`/admin/update-product/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).catch((error: unknown) => {
      console.error('updateFullProduct failed:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  getOrders: () => api.get('/admin/get-orders').catch((error: unknown) => {
    console.error('adminGetOrders failed:', error);
    // If it's a 404 (no orders found), return a successful response with empty orders
    // @ts-expect-error - We're checking for the existence of response property
    if (error.response?.status === 404) {
      return { data: { status: true, orders: [] } };
    }
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),

  updateOrderStatus: (orderId: string, status: string, productId?: string) =>
    api.patch('/admin/update-order-status', { order_id: orderId, status, product_id: productId }).catch((error: unknown) => {
      console.error('updateOrderStatus failed:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  deleteProduct: (productId: number) =>
    api.delete('/admin/delete-product', { data: { productId } }).catch((error: unknown) => {
      console.error('deleteProduct failed:', error);
      const message = getFriendlyErrorMessage(error);
      throw new Error(message);
    }),

  getCategories: () => api.get('/admin/get-categories').catch((error: unknown) => {
    console.error('adminGetCategories failed:', error);
    const message = getFriendlyErrorMessage(error);
    throw new Error(message);
  }),
};
