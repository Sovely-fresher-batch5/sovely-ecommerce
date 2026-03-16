import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Star, Heart, ShoppingCart, Check, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { productApi } from '../features/products/api/productApi.js';
import { CartContext } from '../CartContext.jsx';
import { WishlistContext } from '../WishlistContext.jsx';
import './DropshipProducts.css'; // Let's move the styles to a CSS file!

const SORT_OPTIONS = [
    { value: 'default', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'reviews', label: 'Most Reviewed' },
];

function DropshipProducts({ 
    externalCategory, 
    onCategoryChange, 
    globalSearchQuery = '',
    customTitle = "Featured Products",
    customSubtitle = "Curated products ready to add to your store"
}) {
    const { cartItems, addToCart, updateQuantity } = useContext(CartContext);
    const { isInWishlist, toggleWishlist } = useContext(WishlistContext);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const { data: rawCategories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: productApi.getCategories
    });

    const dbCategories = useMemo(() => 
        rawCategories.filter((cat, index, list) => {
            const normalizedName = cat.name.trim().toLowerCase();
            return index === list.findIndex(item => item.name.trim().toLowerCase() === normalizedName);
        }),
    [rawCategories]);

    // Filter State
    const [category, setCategory] = useState(externalCategory || 'All');
    const [sort, setSort] = useState('default');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState(0);
    const [saleOnly, setSaleOnly] = useState(false);
    const [addedIds, setAddedIds] = useState([]);

    const selectedCatId = useMemo(() => {
        if (category === 'All') return null;
        const found = dbCategories.find(c => c.name === category);
        return found ? found._id : null;
    }, [category, dbCategories]);

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
        queryKey: ['products', selectedCatId, sort, minPrice, maxPrice, minRating, saleOnly, globalSearchQuery],
        queryFn: ({ pageParam = 1 }) => productApi.getProducts({
            page: pageParam,
            limit: 24,
            categoryId: selectedCatId,
            sort,
            minPrice,
            maxPrice,
            minRating,
            saleOnly,
            query: globalSearchQuery
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const page = lastPage?.pagination?.page ?? 1;
            const pages = lastPage?.pagination?.pages ?? 1;
            return page < pages ? page + 1 : undefined;
        }
    });

    const displayProducts = useMemo(() => {
        if (!data) return [];
        return data.pages.flatMap(page => page.products || []).map(p => ({
            id: p._id,
            skuId: p.sku,
            name: p.title,
            category: p.categoryId?.name || p.productType || 'All',
            price: p.platformSellPrice,
            originalPrice: p.compareAtPrice || Math.floor(p.platformSellPrice * 1.2),
            rating: p.averageRating || 4.5,
            reviews: p.reviewCount || 0,
            sale: p.discountPercent > 0,
            image: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&q=80'
        }));
    }, [data]);

    useEffect(() => {
        if (externalCategory && externalCategory !== category) {
            setCategory(externalCategory);
        }
    }, [externalCategory]);

    const handleSetCategory = (cat) => {
        setCategory(cat);
        if (onCategoryChange) onCategoryChange(cat);
    };

    const resetFilters = () => {
        handleSetCategory('All'); setSort('default'); setMinPrice(''); setMaxPrice('');
        setMinRating(0); setSaleOnly(false);
        if (globalSearchQuery) window.history.pushState({}, '', '/');
    };

    const handleAdd = (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        setAddedIds(prev => [...prev, product.id]);
        addToCart({
            _id: product.id, id: product.id, name: product.name,
            price: product.price, image: product.image, sku: product.skuId
        });
        setTimeout(() => setAddedIds(prev => prev.filter(x => x !== product.id)), 1800);
    };

    return (
        <section className="catalog-section">
            <div className="catalog-header">
                <div className="catalog-title-wrapper">
                    <h2 className="catalog-title">{customTitle}</h2>
                    {globalSearchQuery && <p className="catalog-search-text">Search results for: "{globalSearchQuery}"</p>}
                </div>
                
                <div className="catalog-controls">
                    <button className="mobile-filter-btn" onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}>
                        <SlidersHorizontal size={18} /> Filters
                    </button>
                    <div className="sort-dropdown">
                        <span className="sort-label">Sort by:</span>
                        <div className="select-wrapper">
                            <select value={sort} onChange={e => setSort(e.target.value)}>
                                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <ChevronDown size={16} className="select-icon" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="catalog-layout">
                {/* Modernized Sidebar */}
                <aside className={`catalog-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <h3>Filters</h3>
                        <button className="reset-btn" onClick={resetFilters}>Clear All</button>
                    </div>

                    <div className="filter-block">
                        <h4>Category</h4>
                        <div className="filter-options">
                            {[{ _id: 'All', name: 'All' }, ...dbCategories].map(cat => (
                                <label key={cat._id || cat.name} className={`custom-radio ${category === cat.name ? 'active' : ''}`}>
                                    <input type="radio" name="category" checked={category === cat.name} onChange={() => handleSetCategory(cat.name)} />
                                    <span className="radio-text">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="filter-block">
                        <h4>Price Range</h4>
                        <div className="price-inputs-modern">
                            <div className="input-with-symbol">
                                <span>₹</span>
                                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                            </div>
                            <span className="separator">-</span>
                            <div className="input-with-symbol">
                                <span>₹</span>
                                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="filter-block">
                        <h4>Customer Rating</h4>
                        <div className="rating-options">
                            {[4.5, 4.0, 3.5, 0].map(r => (
                                <button key={r} className={`rating-pill ${minRating === r ? 'active' : ''}`} onClick={() => setMinRating(r)}>
                                    {r === 0 ? 'Any' : <>{r}+ <Star size={14} fill="currentColor" /></>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="toggle-switch-wrapper">
                        <span className="toggle-label">Sale Items Only</span>
                        <div className={`toggle-switch ${saleOnly ? 'active' : ''}`} onClick={() => setSaleOnly(!saleOnly)}>
                            <div className="toggle-knob"></div>
                        </div>
                    </label>
                </aside>

                {/* Modernized Product Grid */}
                <div className="catalog-main">
                    {isLoading ? (
                        <div className="product-grid">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="product-card skeleton">
                                    <div className="skeleton-img"></div>
                                    <div className="skeleton-text"></div>
                                    <div className="skeleton-text short"></div>
                                </div>
                            ))}
                        </div>
                    ) : displayProducts.length === 0 ? (
                        <div className="empty-state">
                            <ShoppingCart size={48} color="#cbd5e1" />
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search query.</p>
                            <button className="btn-primary" onClick={resetFilters}>Clear Filters</button>
                        </div>
                    ) : (
                        <>
                            <div className="product-grid">
                                {displayProducts.map(product => {
                                    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                                    const isAdded = addedIds.includes(product.id);
                                    const isWishlisted = isInWishlist(product.id);
                                    const cartItem = cartItems.find(item => item.product.id === product.id);

                                    return (
                                        <Link to={`/product/${product.id}`} className="product-card" key={product.id}>
                                            <div className="card-image-container">
                                                <img src={product.image} alt={product.name} loading="lazy" />
                                                {product.sale && <span className="badge-sale">Sale</span>}
                                                {discount > 0 && <span className="badge-discount">{discount}% OFF</span>}
                                                <button 
                                                    className={`wishlist-fab ${isWishlisted ? 'active' : ''}`}
                                                    onClick={(e) => { e.preventDefault(); toggleWishlist({ id: product.id, ...product }); }}
                                                >
                                                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                                                </button>
                                            </div>

                                            <div className="card-content">
                                                <span className="product-category">{product.category}</span>
                                                <h3 className="product-title">{product.name}</h3>
                                                
                                                <div className="product-rating">
                                                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                                    <span className="rating-score">{product.rating}</span>
                                                    <span className="rating-count">({product.reviews})</span>
                                                </div>

                                                <div className="card-footer">
                                                    <div className="price-block">
                                                        <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
                                                        {discount > 0 && <span className="original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>}
                                                    </div>

                                                    {cartItem ? (
                                                        <div className="quantity-stepper" onClick={e => e.preventDefault()}>
                                                            <button onClick={() => updateQuantity(product.id, -1)}>-</button>
                                                            <span>{cartItem.quantity}</span>
                                                            <button onClick={() => updateQuantity(product.id, 1)}>+</button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
                                                            onClick={(e) => handleAdd(product, e)}
                                                        >
                                                            {isAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {hasNextPage && (
                                <div className="load-more-container">
                                    <button className="btn-load-more" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                                        {isFetchingNextPage ? 'Loading...' : 'Load More Products'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

export default DropshipProducts;