import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../features/products/api/productApi';

function BestDeals() {
    const { data: deals = [], isLoading, isError } = useQuery({
        queryKey: ['bestDeals'],
        queryFn: () => productApi.getBestDeals(3),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    return (
        <section className="deals-section" id="deals">
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">Todays Best Deals For You!</h2>
                </div>

                {isLoading ? (
                    <div className="deals-grid">
                        {[1, 2, 3].map((i) => (
                            <div className="deal-card" key={i} style={{ minHeight: '380px', opacity: 0.6 }}>
                                <div style={{ width: '100%', height: '200px', backgroundColor: '#e2e8f0', borderRadius: '12px 12px 0 0' }}></div>
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ width: '70%', height: '16px', backgroundColor: '#cbd5e1', borderRadius: '4px' }}></div>
                                    <div style={{ width: '90%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
                                    <div style={{ width: '40%', height: '20px', backgroundColor: '#cbd5e1', borderRadius: '4px' }}></div>
                                    <div style={{ width: '100%', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '8px', marginTop: 'auto' }}></div>
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
                            const badge = deal.discountPercent ? `-${deal.discountPercent}%` : null;
                            const image = deal.images?.[0]?.url || 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&q=80';
                            const priceFormatted = `₹${deal.platformSellPrice.toLocaleString('en-IN')}`;
                            const oldPriceFormatted = deal.compareAtPrice ? `₹${deal.compareAtPrice.toLocaleString('en-IN')}` : null;

                            return (
                                <div className="deal-card" key={deal._id} id={`deal-${deal._id}`}>
                                    {badge && <div className="deal-badge">{badge}</div>}
                                    <Link to={`/product/${deal._id}`} className="deal-image-wrapper">
                                        <img src={image} alt={deal.title} className="deal-image" />
                                    </Link>
                                    <div className="deal-info">
                                        <Link to={`/product/${deal._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <h3 className="deal-name">{deal.title}</h3>
                                        </Link>
                                        <p className="deal-description">{deal.categoryId?.name || ''}</p>
                                        <p className="deal-sku-text">SKU: {deal.sku}</p>
                                        <div className="deal-pricing">
                                            <span className="deal-price">{priceFormatted}</span>
                                            {oldPriceFormatted && <span className="deal-old-price">{oldPriceFormatted}</span>}
                                        </div>
                                        <button className="btn-add-cart" id={`btn-add-cart-${deal._id}`}>Add to Cart</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

export default BestDeals;
