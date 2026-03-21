import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const calculateDynamicPrice = (product, quantity) => {
    let price = Number(product.platformSellPrice) || Number(product.price) || Number(product.basePrice) || 0;

    if (product.customPrice) {
        price = Number(product.customPrice);
    }

    if (product.tiers && Array.isArray(product.tiers)) {
        for (const tier of product.tiers) {
            if (quantity >= tier.min) {
                price = Number(tier.price);
            }
        }
    }
    return price;
};

// FIX: A bulletproof helper to safely grab the ID and prevent the `undefined === undefined` bug
const getSafeId = (product) => {
    if (!product) return null;
    return product._id || product.id || null;
};

export const useCartStore = create(
    persist(
        (set) => ({
            cartItems: [],

            addToCart: (product, quantity = null) => {
                set((state) => {
                    const minQuantity = Number(product.moq) || 1;
                    const validQuantity = quantity !== null ? Math.max(Number(quantity), minQuantity) : minQuantity;
                    const incomingId = getSafeId(product);

                    const existingItem = state.cartItems.find(
                        (item) => getSafeId(item.product) === incomingId
                    );

                    if (existingItem) {
                        return {
                            cartItems: state.cartItems.map((item) => {
                                if (getSafeId(item.product) === incomingId) {
                                    const newQuantity = Number(item.quantity) + validQuantity;
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

                    const initialPrice = calculateDynamicPrice(product, validQuantity);
                    return {
                        cartItems: [
                            ...state.cartItems,
                            { product, quantity: validQuantity, price: initialPrice },
                        ],
                    };
                });
            },

            addBulkToCart: (items) => {
                set((state) => {
                    let updatedCart = [...state.cartItems];

                    items.forEach(({ product, quantity }) => {
                        const minQuantity = Number(product.moq) || 1;
                        const validQuantity = Math.max(Number(quantity), minQuantity);
                        const incomingId = getSafeId(product);

                        const existingIndex = updatedCart.findIndex(
                            (item) => getSafeId(item.product) === incomingId
                        );

                        if (existingIndex >= 0) {
                            const newQuantity = Number(updatedCart[existingIndex].quantity) + validQuantity;
                            updatedCart[existingIndex] = {
                                ...updatedCart[existingIndex],
                                quantity: newQuantity,
                                price: calculateDynamicPrice(updatedCart[existingIndex].product, newQuantity),
                            };
                        } else {
                            updatedCart.push({
                                product,
                                quantity: validQuantity,
                                price: calculateDynamicPrice(product, validQuantity),
                            });
                        }
                    });

                    return { cartItems: updatedCart };
                });
            },

            setExactQuantity: (productId, newQuantity) => {
                set((state) => ({
                    cartItems: state.cartItems.map((item) => {
                        if (getSafeId(item.product) === productId) {
                            const minQuantity = Number(item.product.moq) || 1;
                            const safeQuantity = Math.max(minQuantity, parseInt(newQuantity) || minQuantity);

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
                        (item) => getSafeId(item.product) !== productId
                    ),
                }));
            },

            updateQuantity: (productId, change) => {
                set((state) => ({
                    cartItems: state.cartItems
                        .map((item) => {
                            if (getSafeId(item.product) === productId) {
                                const newQuantity = Number(item.quantity) + Number(change);
                                const minQuantity = Number(item.product.moq) || 1;

                                if (newQuantity <= 0) return null;

                                if (newQuantity < minQuantity) {
                                    alert(`Minimum order quantity for ${item.product.title || item.product.name} is ${minQuantity}`);
                                    return item;
                                }

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