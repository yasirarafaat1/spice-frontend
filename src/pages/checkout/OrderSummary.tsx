interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface OrderSummaryProps {
    cartItems: CartItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
}

export default function OrderSummary({ cartItems, subtotal, shipping, tax, total }: OrderSummaryProps) {
    return (
        <div className="bg-black rounded-xl shadow-md p-6 sticky top-8">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold text-white text-sm line-clamp-2">
                                {item.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Qty: {item.quantity} × ${item.price}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-4 mb-6">
                <div className="flex justify-between text-white">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white">
                    <span>Shipping</span>
                    <span className="font-semibold">
                        {shipping === 0 ? (
                            <span className="text-emerald-600">Free</span>
                        ) : (
                            `$${shipping.toFixed(2)}`
                        )}
                    </span>
                </div>
                <div className="flex justify-between text-white">
                    <span>Tax</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-white">Total</span>
                    <span className="text-2xl font-bold text-amber-700">
                        ${total.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
}

