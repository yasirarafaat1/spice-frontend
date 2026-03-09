export interface Product {
    id: string;
    images: (File | string)[];
    name: string;
    title: string;
    description: string;
    mrp: number;
    sellingPrice: number;
    discountPercentage: number;
    specification: string;
    stock: number | 'in stock';
    stockType: 'number' | 'dropdown';
    category: string;
    skuId: string;
  // sellingPriceLink removed (payment link not used)
    product_video?: string; // Add product_video field
}

export type ProductFormData = Omit<Product, 'id'>;
