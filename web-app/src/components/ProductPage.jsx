import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSuspenseQuery } from '@tanstack/react-query';
import { productApi } from '../features/products/api/productApi.js';
import { CartContext } from '../CartContext.jsx';
import { WishlistContext } from '../WishlistContext.jsx';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './ProductPage.css';
import './LandingPage.css';

function ProductPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems } = useContext(CartContext);
    const { isInWishlist, toggleWishlist } = useContext(WishlistContext);

    const { data: p } = useSuspenseQuery({
        queryKey: ['product', productId],
        queryFn: () => productApi.getProductById(productId)
    });

    // Fetch similar products based on category
    const { data: similarResults } = useSuspenseQuery({
        queryKey: ['similar-products', p?.categoryId?._id],
        queryFn: () => productApi.getProducts({ 
            categoryId: p?.categoryId?._id, 
            limit: 5 // Fetch slightly more to filter out current product
        }),
        enabled: !!p?.categoryId?._id
    });

    const [selectedColor, setSelectedColor] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    // Map backend data to component needs
    const product = React.useMemo(() => {
        if (!p) return null;
        const rawDesc = p.descriptionHTML || '';
        const textDesc = rawDesc.replace(/<[^>]*>?/gm, '');
        
        return {
            id: p._id,
            skuId: p.sku,
            name: p.title,
            category: p.categoryId?.name || p.productType || 'Shopping',
            categoryId: p.categoryId?._id,
            subcategory: p.vendor || 'General',
            price: `₹${p.platformSellPrice.toLocaleString('en-IN')}`,
            oldPrice: p.compareAtPrice ? `₹${p.compareAtPrice.toLocaleString('en-IN')}` : null,
            monthlyPrice: `₹${Math.round(p.platformSellPrice / 6).toLocaleString('en-IN')}/mo`,
            summary: textDesc.length > 180 ? textDesc.substring(0, 180) + '...' : textDesc,
            descriptionHTML: rawDesc,
            images: p.images?.length > 0 ? p.images.map(img => img.url) : ['https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&q=80'],
            rating: 4.5,
            reviewCount: Math.floor(Math.random() * 200) + 10,
            stock: p.inventory?.stock || 50,
            moq: p.moq || 1,
            weight: p.weightGrams ? `${(p.weightGrams / 1000).toFixed(2)} KG` : 'N/A',
            colors: ['#000000', '#silver', '#ffffff'],
            returnPolicy: 'Hassle-free 7-day B2B returns'
        }
    }, [p]);

    const similarProducts = React.useMemo(() => {
        if (!similarResults?.products) return [];
        return similarResults.products
            .filter(item => item._id !== productId)
            .slice(0, 4)
            .map(item => ({
                id: item._id,
                name: item.title,
                price: `₹${item.platformSellPrice.toLocaleString('en-IN')}`,
                image: item.images?.[0]?.url || 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&q=80',
                subcategory: item.vendor || 'General',
                skuId: item.sku,
                rating: 4.5
            }));
    }, [similarResults, productId]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [productId]);

    if (!product) return null;

    const handleQuantityChange = (delta) => {
        const newQty = Math.max(product.moq, Math.min(quantity + delta, product.stock));
        setQuantity(newQty);
    };

    // Initialize quantity to MOQ if needed
    useEffect(() => {
        if (product && quantity < product.moq) {
            setQuantity(product.moq);
        }
    }, [product]);

    // Generate star rating
    const fullStars = Math.floor(product.rating);
    const hasHalf = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
        <div className="layout-container">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <div className="main-viewport">
                <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                <main className="product-page-main">
                    {/* Breadcrumb */}
                    <nav className="pp-breadcrumb">
                        <Link to="/" className="pp-breadcrumb-link">Home</Link>
                        <span className="pp-breadcrumb-sep">›</span>
                        <span className="pp-breadcrumb-link">{product.category}</span>
                        <span className="pp-breadcrumb-sep">›</span>
                        <span className="pp-breadcrumb-link">{product.subcategory}</span>
                        <span className="pp-breadcrumb-sep">›</span>
                        <span className="pp-breadcrumb-current">{product.name}</span>
                    </nav>

                    {/* Product Detail Grid */}
                    <div className="pp-detail-grid">
                        {/* Image Gallery */}
                        <div className="pp-gallery">
                            <div className="pp-main-image-wrapper">
                                <img
                                    src={product.images[selectedImage] || product.images[0]}
                                    alt={product.name}
                                    className="pp-main-image"
                                />
                            </div>
                            <div className="pp-thumbnail-row">
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        className={`pp-thumbnail ${selectedImage === i ? 'pp-thumbnail-active' : ''}`}
                                        onClick={() => setSelectedImage(i)}
                                    >
                                        <img src={img} alt={`${product.name} view ${i + 1}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="pp-info">
                            <div className="pp-info-header">
                                <div className="pp-badge-row">
                                    <span className="pp-type-badge">{product.category}</span>
                                    <span className="pp-stock-status">
                                        <span className="pulse-dot"></span>
                                        {product.stock} Units Available
                                    </span>
                                </div>
                                <h1 className="pp-title">{product.name}</h1>
                                <p className="pp-summary">{product.summary}</p>
                                <div className="pp-meta-info">
                                    <span className="pp-sku"><b>SKU:</b> {product.skuId}</span>
                                    <span className="pp-moq"><b>MOQ:</b> {product.moq} Units</span>
                                </div>

                                {/* Rating */}
                                <div className="pp-rating">
                                    <div className="pp-stars">
                                        {Array(fullStars).fill(null).map((_, i) => (
                                            <span key={`full-${i}`} className="pp-star pp-star-filled">★</span>
                                        ))}
                                        {hasHalf && <span className="pp-star pp-star-filled">★</span>}
                                        {Array(emptyStars).fill(null).map((_, i) => (
                                            <span key={`empty-${i}`} className="pp-star pp-star-empty">★</span>
                                        ))}
                                    </div>
                                    <span className="pp-review-count">{product.reviewCount}+ Satisfied Buyers</span>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="pp-pricing-section">
                                <div className="pp-price-card">
                                    <div className="pp-price-row">
                                        <span className="pp-current-price">{product.price}</span>
                                        {product.oldPrice && (
                                            <span className="pp-old-price">{product.oldPrice}</span>
                                        )}
                                    </div>
                                    <p className="pp-tax-note">Excluding GST and Shipping calculated at checkout.</p>
                                </div>
                            </div>

                            {/* Color Picker (Only if relevant) */}
                            {product.colors.length > 0 && (
                                <div className="pp-color-section">
                                    <h3 className="pp-section-label">Available Variations</h3>
                                    <div className="pp-color-options">
                                        {product.colors.map((color, i) => (
                                            <button
                                                key={i}
                                                className={`pp-color-swatch ${selectedColor === i ? 'pp-color-active' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setSelectedColor(i)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity + Actions */}
                            <div className="pp-purchase-zone">
                                <div className="pp-quantity-selector">
                                    <button
                                        className="pp-qty-btn"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= product.moq}
                                    >
                                        −
                                    </button>
                                    <input 
                                        type="number" 
                                        className="pp-qty-input" 
                                        value={quantity}
                                        readOnly
                                    />
                                    <button
                                        className="pp-qty-btn"
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= product.stock}
                                    >
                                        +
                                    </button>
                                </div>
                                
                                <div className="pp-actions-stack">
                                    <button
                                        className="pp-btn-cart-premium full-width"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            addToCart({
                                                id: product.id,
                                                name: product.name,
                                                price: typeof product.price === 'string' ? parseFloat(product.price.replace(/[^0-9.-]+/g, "")) : product.price,
                                                image: product.images[0],
                                                sku: product.skuId
                                            }, quantity);
                                            // Simple toast would be better than alert
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="pp-trust-grid">
                                <div className="pp-trust-item">
                                    <span className="pp-trust-icon">⚡</span>
                                    <div className="pp-trust-content">
                                        <h6>Standard Shipping</h6>
                                        <p>Delivered in 4-7 Days</p>
                                    </div>
                                </div>
                                <div className="pp-trust-item">
                                    <span className="pp-trust-icon">🛡️</span>
                                    <div className="pp-trust-content">
                                        <h6>Buyer Protection</h6>
                                        <p>Secure B2B Transactions</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabbed Info Section */}
                    <section className="pp-detailed-tabs">
                        <div className="pp-tab-nav">
                            {['description', 'specifications', 'shipping'].map(tab => (
                                <button
                                    key={tab}
                                    className={`pp-tab-trigger ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                        
                        <div className="pp-tab-panel">
                            {activeTab === 'description' && (
                                <div 
                                    className="pp-html-content"
                                    dangerouslySetInnerHTML={{ __html: product.descriptionHTML }}
                                />
                            )}
                            {activeTab === 'specifications' && (
                                <div className="pp-specs-list">
                                    <div className="pp-spec-item">
                                        <span className="spec-label">SKU ID</span>
                                        <span className="spec-value">{product.skuId}</span>
                                    </div>
                                    <div className="pp-spec-item">
                                        <span className="spec-label">Weight</span>
                                        <span className="spec-value">{product.weight}</span>
                                    </div>
                                    <div className="pp-spec-item">
                                        <span className="spec-label">MOQ</span>
                                        <span className="spec-value">{product.moq} Units</span>
                                    </div>
                                    <div className="pp-spec-item">
                                        <span className="spec-label">Brand/Vendor</span>
                                        <span className="spec-value">{product.subcategory}</span>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'shipping' && (
                                <div className="pp-shipping-info">
                                    <h5>B2B Logistics & Shipping</h5>
                                    <p>We offer specialized shipping for bulk orders across India. Shipping costs are calculated based on the total weight of the order and the destination pincode.</p>
                                    <ul>
                                        <li>Order Processing: 24-48 Business Hours</li>
                                        <li>Transit Time: 3-7 Business Days (Varies by load)</li>
                                        <li>Return Policy: {product.returnPolicy}</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Similar Items Section */}
                    <section className="pp-similar-section">
                        <div className="pp-similar-header">
                            <div>
                                <h2 className="pp-similar-title">Similar Items You Might Like</h2>
                                <p className="pp-similar-subtitle">Products from the same category</p>
                            </div>
                            <Link to="/" className="pp-view-all">
                                View All <span className="pp-arrow">→</span>
                            </Link>
                        </div>

                        <div className="pp-similar-grid">
                            {similarProducts.map((item) => (
                                <Link
                                    to={`/product/${item.id}`}
                                    className="pp-similar-card"
                                    key={item.id}
                                >
                                    <div className="pp-similar-image-wrapper">
                                        <img src={item.image} alt={item.name} className="pp-similar-image" />
                                        <button
                                            className={`pp-wishlist-btn ${isInWishlist(item.id) ? 'pc-wishlist-active' : ''}`}
                                            style={{ color: isInWishlist(item.id) ? '#ef4444' : 'inherit' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleWishlist({ id: item.id, ...item });
                                            }}
                                        >
                                            ♥
                                        </button>
                                    </div>
                                    <div className="pp-similar-info">
                                        <div className="pp-similar-top-row">
                                            <h3 className="pp-similar-name">{item.name}</h3>
                                            <span className="pp-similar-price">{item.price}</span>
                                        </div>
                                        <p className="pp-similar-desc">{item.subcategory}</p>
                                        <p className="pp-similar-sku">SKU: {item.skuId}</p>
                                        <div className="pp-similar-rating">
                                            {Array(Math.floor(item.rating)).fill(null).map((_, i) => (
                                                <span key={i} className="pp-star pp-star-filled pp-star-sm">★</span>
                                            ))}
                                            {Array(5 - Math.floor(item.rating)).fill(null).map((_, i) => (
                                                <span key={i} className="pp-star pp-star-empty pp-star-sm">★</span>
                                            ))}
                                            <span className="pp-similar-rating-text">({item.rating})</span>
                                        </div>
                                        <button
                                            className="pp-similar-cart-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addToCart(item, 1);
                                            }}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </div>
    );
}

export default ProductPage;
