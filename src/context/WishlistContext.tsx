import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../utils/productUtils';
import { userAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
    wishlistItems: Product[];
    addToWishlist: (product: Product) => Promise<void>;
    removeFromWishlist: (productId: number) => Promise<void>;
    isInWishlist: (productId: number) => boolean;
    clearWishlist: () => Promise<void>; // Add function to clear wishlist on logout
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const email = user?.email || '';

    const loadWishlist = useCallback(async () => {
        if (!email) {
            setWishlistItems([]);
            return;
        }
        try {
            const res = await userAPI.getWishlist(email);
            const products: Product[] = res?.data?.products || [];
            setWishlistItems(products);
        } catch (error) {
            console.error('Failed to load wishlist:', error);
            setWishlistItems([]);
        }
    }, [email]);

    useEffect(() => {
        if (isAuthenticated) {
            loadWishlist();
        } else {
            setWishlistItems([]);
        }
    }, [isAuthenticated, loadWishlist]);

    const addToWishlist = async (product: Product) => {
        if (!email) {
            throw new Error('Login required to use wishlist');
        }
        try {
            const res = await userAPI.addWishlist(email, product.product_id);
            const products: Product[] = res?.data?.products || [];
            setWishlistItems(products);
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            throw error;
        }
    };

    const removeFromWishlist = async (productId: number) => {
        if (!email) {
            throw new Error('Login required to use wishlist');
        }
        try {
            const res = await userAPI.removeWishlist(email, productId);
            const products: Product[] = res?.data?.products || [];
            setWishlistItems(products);
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            throw error;
        }
    };

    const clearWishlist = async () => {
        if (!email) {
            setWishlistItems([]);
            return;
        }
        try {
            await userAPI.clearWishlist(email);
            setWishlistItems([]);
        } catch (error) {
            console.error('Failed to clear wishlist:', error);
        }
    };

    const isInWishlist = (productId: number) => {
        return wishlistItems.some(item => item.product_id === productId);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                clearWishlist
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};
