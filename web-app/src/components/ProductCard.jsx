import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Box } from 'lucide-react';

function ProductCard({ 
    product, 
    inCart, 
    isInWishlist, 
    onToggleWishlist, 
    onAddToCart, 
    onUpdateQuantity,
    isAdded,
    badge
}) {
    const {
        id,
        sku,
        title,
        price,
        mrp,
        image,
        inventory,
        weight,
        rating
    } = product;

    return (
        <div className="unified-product-card" id={`product-${id}`}>
            <div className="card-media">
                {badge && <div className="card-promo-badge">{badge}</div>}
                {weight && <div className="premium-weight-tag">{weight}</div>}
                
                <Link to={`/product/${id}`} className="image-link">
                    <img src={image} alt={title} loading="lazy" />
                </Link>
                
                <button 
                    className={`wish-btn ${isInWishlist ? 'active' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        onToggleWishlist(product);
                    }}
                    aria-label="Toggle Wishlist"
                >
                    <Heart size={18} fill={isInWishlist ? "var(--color-primary)" : "none"} />
                </button>
            </div>
            
            <div className="card-info">
                <div className="card-meta-stack">
                    <div className="sku-container">
                        <span className="premium-sku-tag">SKU: {sku}</span>
                    </div>
                    <div className="rating-container">
                        <div className="rating-badge">
                            <Star size={12} fill="#F59E0B" color="#F59E0B" />
                            <span>{rating ? rating.toFixed(1) : '4.5'}</span>
                        </div>
                    </div>
                </div>

                <Link to={`/product/${id}`} className="title-link">
                    <h3 className="premium-product-title" title={title}>{title}</h3>
                </Link>
                
                <div className="inventory-status">
                    <Box size={14} />
                    <span>Inventory: <b style={{color: inventory > 10 ? 'var(--color-success)' : '#f59e0b'}}>{inventory}</b> available</span>
                </div>

                <div className="price-container">
                    <div className="main-price">
                        <span className="currency">₹</span>
                        <span className="amount">{price.toLocaleString('en-IN')}</span>
                    </div>
                    {mrp && <span className="mrp-price">₹{Math.floor(mrp).toLocaleString('en-IN')}</span>}
                </div>

                <div className="card-actions">
                    {inCart ? (
                        <div className="qty-stepper-b2b">
                            <button onClick={(e) => { e.preventDefault(); onUpdateQuantity(id, -1); }}>-</button>
                            <input type="text" readOnly value={inCart.quantity} />
                            <button onClick={(e) => { e.preventDefault(); onUpdateQuantity(id, 1); }}>+</button>
                        </div>
                    ) : (
                        <button 
                            className={`add-b2b-btn ${isAdded ? 'added' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                onAddToCart(product);
                            }}
                        >
                            <ShoppingCart size={18} />
                            {isAdded ? 'Added' : 'Add to Cart'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
