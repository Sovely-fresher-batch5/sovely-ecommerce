import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../features/products/api/productApi';
import { CartContext } from '../CartContext';
import { WishlistContext } from '../WishlistContext';
import ProductCard from './ProductCard.jsx';

function BestDeals() {
    const { cartItems, addToCart, updateQuantity } = useContext(CartContext);
    const { isInWishlist, toggleWishlist } = useContext(WishlistContext);

    const { data: deals = [], isLoading, isError } = useQuery({
        queryKey: ['bestDeals'],
        queryFn: () => productApi.getBestDeals(3),
    });

    const handleAdd = (product) => {
        addToCart({
            id: product.id,
            name: product.title,
            price: product.price,
            image: product.image,
            sku: product.sku
        });
    };

    return (
        <section className="deals-section" id="deals">
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">Todays Best Deals For You!</h2>
                </div>

                {isLoading ? (
                    <div className="deals-grid">
                        {[1, 2, 3].map((i) => (
                            <div className="deal-card-skeleton" key={i}>
                                <div className="skeleton-media"></div>
                                <div className="skeleton-info">
                                    <div className="skeleton-line"></div>
                                    <div className="skeleton-line short"></div>
                                    <div className="skeleton-line medium"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Unable to load deals right now.</p>
                ) : deals.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No deals available at the moment.</p>
                ) : (
                    <div className="deals-grid">
                        {deals.map((deal) => {
                            const normalizedProduct = {
                                id: deal._id,
                                sku: deal.sku || 'N/A',
                                title: deal.title,
                                price: deal.platformSellPrice,
                                mrp: deal.compareAtPrice || deal.platformSellPrice * 1.5,
                                image: deal.images?.[0]?.url || 'https://via.placeholder.com/300',
                                inventory: deal.inventoryQuantity || 0,
                                weight: deal.payloadWeight || '500g',
                                rating: 4 + Math.random() * 1
                            };
                            
                            const inCart = cartItems.find(item => item.product.id === deal._id);
                            const badge = deal.discountPercent ? `-${deal.discountPercent}%` : null;

                            return (
                                <ProductCard 
                                    key={deal._id}
                                    product={normalizedProduct}
                                    inCart={inCart}
                                    isInWishlist={isInWishlist(deal._id)}
                                    onToggleWishlist={toggleWishlist}
                                    onAddToCart={handleAdd}
                                    onUpdateQuantity={updateQuantity}
                                    badge={badge}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

export default BestDeals;
