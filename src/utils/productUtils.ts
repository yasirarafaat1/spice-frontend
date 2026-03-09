export interface Product {
    product_id: number;
    name: string;
    title?: string;
    description?: string | null;
    price: number;
    selling_price: number;
    product_image: string | string[] | { [key: string]: string };
    quantity: number;
    createdAt?: string;
    updatedAt?: string;
    Catagory?: {
        id: number;
        name: string;
    };
}

export const getImageUrl = (productImage: string | string[] | { [key: string]: string } | undefined): string => {
    if (!productImage) return '';
    if (typeof productImage === 'string') {
        return productImage;
    }
    if (Array.isArray(productImage)) {
        return productImage[0] || '';
    }
    if (typeof productImage === 'object') {
        const values = Object.values(productImage);
        return values[0] || '';
    }
    return '';
};

// Utility function to truncate text to a maximum number of words
export const truncateText = (text: string, maxWords: number = 5): string => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
};

// Check if product was created/listed in last 3 days (gets "new" tag)
export const isProductNew = (product: Product): boolean => {
    if (!product.createdAt) return false;
    const productDate = new Date(product.createdAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return productDate >= threeDaysAgo;
};

// Check if product was created in last 3 days (appears in bestsellers section)
export const isProductBestSeller = (product: Product): boolean => {
    if (!product.createdAt) return false;
    const productDate = new Date(product.createdAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return productDate >= threeDaysAgo;
};

