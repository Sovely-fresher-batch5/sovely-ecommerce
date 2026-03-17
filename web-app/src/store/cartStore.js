import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const calculateDynamicPrice = (product, quantity) => {
    let price = product.price || product.basePrice || 0;
    if (product.tiers && Array.isArray(product.tiers)) {
        for (const tier of product.tiers) {
            if (quantity >= tier.min) {
                price = tier.price;
            }
        }
    }
    return price;
};

export const useCartStore = create(
    persist(
        (set) => ({
            cartItems: [],

            addToCart: (product, quantity = 1) => {
                set((state) => {
                    const existingItem = state.cartItems.find(
                        (item) => item.product._id === product._id || item.product.id === product.id
                    );

                    if (existingItem) {
                        return {
                            cartItems: state.cartItems.map((item) => {
                                if (
                                    item.product._id === product._id ||
                                    item.product.id === product.id
                                ) {
                                    const newQuantity = item.quantity + quantity;
                                    return {
                                        ...item,
                                        quantity: newQuantity,
                                        price: calculateDynamicPrice(item.product, newQuantity),
                                    };
                                }
                                return item;
                            }),
                        };
                    }

                    const initialPrice = calculateDynamicPrice(product, quantity);
                    return {
                        cartItems: [...state.cartItems, { product, quantity, price: initialPrice }],
                    };
                });
            },

            setExactQuantity: (productId, newQuantity) => {
                set((state) => ({
                    cartItems: state.cartItems.map((item) => {
                        const isMatch =
                            item.product._id === productId || item.product.id === productId;
                        if (isMatch) {
                            const safeQuantity = Math.max(1, parseInt(newQuantity) || 1);
                            return {
                                ...item,
                                quantity: safeQuantity,
                                price: calculateDynamicPrice(item.product, safeQuantity),
                            };
                        }
                        return item;
                    }),
                }));
            },

            removeFromCart: (productId) => {
                set((state) => ({
                    cartItems: state.cartItems.filter(
                        (item) => item.product._id !== productId && item.product.id !== productId
                    ),
                }));
            },

            updateQuantity: (productId, change) => {
                set((state) => ({
                    cartItems: state.cartItems
                        .map((item) => {
                            const isMatch =
                                item.product._id === productId || item.product.id === productId;
                            if (isMatch) {
                                const newQuantity = item.quantity + change;
                                if (newQuantity <= 0) return null;
                                return {
                                    ...item,
                                    quantity: newQuantity,
                                    price: calculateDynamicPrice(item.product, newQuantity),
                                };
                            }
                            return item;
                        })
                        .filter(Boolean),
                }));
            },

            clearCart: () => set({ cartItems: [] }),
        }),
        {
            name: 'sovely_cart',
        }
    )
);
