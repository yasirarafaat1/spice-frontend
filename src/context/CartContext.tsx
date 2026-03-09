import {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    ReactNode,
} from "react";
import { userAPI } from "../services/api";
import { useAuth } from "./AuthContext";

export interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    stock?: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (
        productId: number,
        productData?: {
            name: string;
            price: number;
            image: string;
            stock?: number;
        },
        quantity?: number
    ) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
    saveCartToLocalStorage: () => void;
    isInCart: (productId: number) => boolean;
    buyNow: (productId: number) => void;
    setBuyNowItem: (itemId: number | null) => void;
    buyNowItemId: number | null; // Add this property
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    // Prevent saving to localStorage during first load
    const firstLoadRef = useRef(true);

    useEffect(() => {
        loadCart();
    }, [isAuthenticated]);

    // Handle pending cart operations after login
    useEffect(() => {
        if (isAuthenticated) {
            // Check if there's a pending "Add to Cart" operation
            const pendingAddToCart = localStorage.getItem('pendingAddToCart');
            if (pendingAddToCart) {
                try {
                    const productInfo = JSON.parse(pendingAddToCart);
                    // Add the product to cart
                    setCartItems((prevItems) => {
                        const existingItem = prevItems.find((item) => item.id === productInfo.id);

                        if (!existingItem) {
                            // If item doesn't exist, add new item with quantity 1
                            const newItem: CartItem = {
                                id: productInfo.id,
                                name: productInfo.name,
                                price: productInfo.price,
                                image: productInfo.image,
                                quantity: 1,
                                stock: productInfo.stock
                            };
                            return [...prevItems, newItem];
                        }
                        return prevItems;
                    });

                    // Save to backend
                    userAPI.addToCart(productInfo.id, 1).catch((error) => {
                        console.warn("Failed to add item to cart on backend:", error);
                    });
                } catch (e) {
                    console.error('Error parsing pendingAddToCart:', e);
                }

                // Clear the pending operation
                localStorage.removeItem('pendingAddToCart');
            }

            // Check if there's a pending "Buy Now" operation
            const pendingBuyNow = localStorage.getItem('pendingBuyNow');
            if (pendingBuyNow) {
                try {
                    const productId = parseInt(pendingBuyNow);
                    if (!isNaN(productId)) {
                        // Set the buy now item ID
                        // We'll handle this in the component that needs it
                    }
                } catch (e) {
                    console.error('Error parsing pendingBuyNow:', e);
                }

                // Clear the pending operation
                localStorage.removeItem('pendingBuyNow');
            }
        }
    }, [isAuthenticated]);

    const loadCart = async () => {
        // If user is not authenticated, don't attempt to load from backend
        if (!isAuthenticated) {
            // Clear any existing cart items
            setCartItems([]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await userAPI.getCart();
            if (response.data) {
                // Transform the backend response to match CartItem interface
                const transformedItems = response.data.map((item: {
                    Product: {
                        product_id: number;
                        title: string;
                        price: number;
                        selling_price?: number; // Made selling_price optional
                        product_image: string | string[] | { [key: string]: string };
                    };
                    quantity: number;
                }) => {
                    // Process product_image to extract a valid image URL
                    let imageUrl = '';
                    if (typeof item.Product.product_image === 'string') {
                        imageUrl = item.Product.product_image;
                    } else if (Array.isArray(item.Product.product_image)) {
                        imageUrl = item.Product.product_image[0] || '';
                    } else if (typeof item.Product.product_image === 'object' && item.Product.product_image !== null) {
                        const imageValues = Object.values(item.Product.product_image);
                        imageUrl = imageValues[0] || '';
                    }

                    // Determine the correct price to use
                    let priceToUse: number;
                    if (typeof item.Product.selling_price === 'number' && !isNaN(item.Product.selling_price) && item.Product.selling_price > 0) {
                        priceToUse = item.Product.selling_price;
                    } else if (typeof item.Product.price === 'number' && !isNaN(item.Product.price) && item.Product.price > 0) {
                        priceToUse = item.Product.price;
                    } else {
                        // Fallback to 0 if no valid price is found
                        priceToUse = 0;
                    }

                    return {
                        id: item.Product.product_id,
                        name: item.Product.title,
                        price: priceToUse,
                        image: imageUrl,
                        quantity: item.quantity,
                    };
                });

                // Deduplicate items by ID, using the quantity from the first occurrence
                const deduplicatedItems = transformedItems.reduce((acc: CartItem[], item: CartItem) => {
                    const existingItem = acc.find((i) => i.id === item.id);
                    if (!existingItem) {
                        // If item doesn't exist, add it to the array
                        acc.push(item);
                    }
                    // If item already exists, we ignore the duplicate (keep the first one)
                    return acc;
                }, []);

                setCartItems(deduplicatedItems);
                setIsLoading(false);
                return;
            }
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const axiosError = error as { response?: { status?: number; data?: unknown }; code?: string; message?: string };
                if (axiosError.response?.status === 404) {
                    console.warn("Cart endpoint /user/cart not available.");
                } else if (axiosError.response?.status === 403) {
                    console.warn("Authentication required for cart.");
                } else if (axiosError.code === "ERR_NETWORK" || axiosError.message?.includes("CORS")) {
                    console.warn("Network error loading cart.");
                } else {
                    console.warn("Failed to load cart from backend.");
                }
            } else {
                console.warn("Failed to load cart from backend.");
            }
        }

        // Don't load from localStorage when user is not authenticated
        // Clear any existing cart items
        setCartItems([]);
        setIsLoading(false);
    };

    // Save cart AFTER initial load
    useEffect(() => {
        if (isLoading) return;

        // Skip saving on first render
        if (firstLoadRef.current) {
            firstLoadRef.current = false;
            return;
        }

        // Only save to backend when user is authenticated
        if (isAuthenticated) {
            // Save to backend (if exists)
            userAPI.saveCart(cartItems as unknown as Record<string, unknown>[]).catch((error: unknown) => {
                if (typeof error === 'object' && error !== null && 'response' in error) {
                    const axiosError = error as { response?: { status?: number }; code?: string; message?: string };
                    if (axiosError.response?.status !== 404) {
                        if (axiosError.code === "ERR_NETWORK" || axiosError.message?.includes("CORS")) {
                            console.warn("Network error saving cart.");
                        } else {
                            console.warn("Failed to save cart to backend.");
                        }
                    }
                } else {
                    console.warn("Failed to save cart to backend.");
                }
            });
        }
        // Don't save to localStorage when user is not authenticated
    }, [cartItems, isLoading, isAuthenticated]);

    const addToCart = (
        productId: number,
        productData?: {
            name: string;
            price: number;
            image: string;
            stock?: number;
        },
        quantity: number = 1
    ) => {
        // If user is not authenticated, save product info and redirect to login
        if (!isAuthenticated) {
            // Save product info to localStorage for use after login
            if (productData) {
                const productInfo = {
                    id: productId,
                    ...productData
                };
                localStorage.setItem('pendingAddToCart', JSON.stringify(productInfo));
                // Save current path to redirect back after login
                localStorage.setItem('redirectAfterLogin', '/cart');
            }
            // Redirect to login page
            window.location.href = '/log';
            return;
        }

        const desiredQty = Math.max(1, quantity);

        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === productId);

            if (existingItem) {
                // Update its quantity to desiredQty
                return prevItems.map((item) =>
                    item.id === productId ? { ...item, quantity: desiredQty } : item
                );
            } else if (productData) {
                // If item doesn't exist and productData is provided, add new item
                const newItem: CartItem = {
                    id: productId,
                    name: productData.name,
                    price: productData.price,
                    image: productData.image,
                    quantity: desiredQty,
                    stock: productData.stock
                };
                return [...prevItems, newItem];
            }

            return prevItems;
        });

        // Save to backend if authenticated
        if (isAuthenticated) {
            userAPI.addToCart(productId, desiredQty).catch((error) => {
                console.warn("Failed to add item to cart on backend:", error);
            });
        }
    };

    const removeFromCart = (productId: number) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));

        // Remove from backend if authenticated
        if (isAuthenticated) {
            userAPI.removeFromCart(productId).catch((error) => {
                console.warn("Failed to remove item from cart on backend:", error);
            });
        }
    };

    const updateQuantity = (productId: number, quantity: number) => {
        const desiredQty = Math.max(1, quantity);

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, quantity: desiredQty } : item
            )
        );

        if (isAuthenticated) {
            userAPI.updateCartItem(productId, desiredQty).catch((error) => {
                console.warn("Failed to update cart item on backend:", error);
            });
        }
    };

    const clearCart = () => {
        setCartItems([]);

        // Clear on backend if authenticated
        if (isAuthenticated) {
            userAPI.clearCart().catch((error) => {
                console.warn("Failed to clear cart on backend:", error);
            });
        }
    };

    const saveCartToLocalStorage = () => {
        // Don't save to localStorage when user is not authenticated
        if (isAuthenticated) {
            // This function is kept for backward compatibility but should not be used
            // All cart persistence should happen through the backend
        }
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Add this new method to check if a product is in the cart
    const isInCart = (productId: number) => {
        return cartItems.some(item => item.id === productId);
    };

    // Add this new method for buying a single item
    const [buyNowItemId, setBuyNowItem] = useState<number | null>(null);

    const buyNow = (productId: number) => {
        // If user is not authenticated, save product info and redirect to login
        if (!isAuthenticated) {
            // Save the product ID for use after login
            localStorage.setItem('pendingBuyNow', productId.toString());
            // Save current path to redirect back after login
            localStorage.setItem('redirectAfterLogin', '/checkout');
            // Redirect to login page
            window.location.href = '/log';
            return;
        }

        // Set the buy now item ID
        setBuyNowItem(productId);
        // Navigation is now handled by the component that calls this function
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalPrice,
                getTotalItems,
                saveCartToLocalStorage,
                isInCart,
                buyNow,
                setBuyNowItem,
                buyNowItemId, // Add this property to the context value
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
