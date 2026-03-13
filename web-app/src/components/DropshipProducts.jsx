import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { productApi } from '../features/products/api/productApi.js';
import { CartContext } from '../CartContext.jsx';
import { WishlistContext } from '../WishlistContext.jsx';
import ProductCard from './ProductCard.jsx';
import { RotateCcw, Filter } from 'lucide-react';

function DropshipProducts({ externalCategory, onCategoryChange, externalWeight, searchQuery, onResetAll }) {
    const { cartItems, addToCart, updateQuantity } = useContext(CartContext);
    const { isInWishlist, toggleWishlist } = useContext(WishlistContext);
    
    // --- Filter State ---
    const [category, setCategory] = useState(externalCategory || 'All');
    const [priceRange, setPriceRange] = useState(5000); // Max price limit for slider
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setBy] = useState('featured');
    const [addedIds, setAddedIds] = useState([]);

    // Sync external category changes
    useEffect(() => {
        if (externalCategory) {
            setCategory(externalCategory);
        }
    }, [externalCategory]);

    // Fetch categories for sidebar
    const { data: rawCategories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: productApi.getCategories
    });

    const dbCategories = useMemo(() =>
        rawCategories.filter((cat, index, list) => {
            const normalizedName = cat.name.trim().toLowerCase();
            return index === list.findIndex(item => item.name.trim().toLowerCase() === normalizedName);
        }), [rawCategories]
    );

    const selectedCatId = useMemo(() => {
        if (category === 'All') return null;
        const found = dbCategories.find(c => c.name === category);
        return found ? found._id : null;
    }, [category, dbCategories]);

    // Data Fetching
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['products', selectedCatId, searchQuery], // Include searchQuery in key
        queryFn: ({ pageParam = 1 }) => productApi.getProducts({
            page: pageParam,
            limit: 40,
            query: searchQuery, // Pass search query to API
            categoryId: selectedCatId || 'All'
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const page = lastPage?.pagination?.page ?? 1;
            const pages = lastPage?.pagination?.pages ?? 1;
            return page < pages ? page + 1 : undefined;
        }
    });

    // --- Modern Transformation & Client-side filtering/sorting ---
    const products = useMemo(() => {
        if (!data) return [];
        let list = data.pages.flatMap(page => page.products || []).map(p => ({
            id: p._id,
            sku: p.sku || 'N/A',
            title: p.title,
            price: p.platformSellPrice,
            mrp: p.compareAtPrice || p.platformSellPrice * 1.5,
            image: p.images?.[0]?.url || 'https://via.placeholder.com/300',
            inventory: p.inventoryQuantity || 0,
            weight: p.payloadWeight || '500', // Ensure it's numeric/parsable
            rating: 4 + Math.random() * 1,
            sales: Math.floor(Math.random() * 1000)
        }));

        // Apply Search Filter (New)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(p => 
                p.title.toLowerCase().includes(q) || 
                p.sku.toLowerCase().includes(q)
            );
        }

        // Apply Price Filter
        list = list.filter(p => p.price <= priceRange);

        // Apply Stock Filter
        if (inStockOnly) {
            list = list.filter(p => p.inventory > 0);
        }

        // Apply Weight Filter (New)
        if (externalWeight && externalWeight !== 'All') {
            const [min, max] = externalWeight.split('-').map(Number);
            list = list.filter(p => {
                const w = parseFloat(String(p.weight).replace(/[^0-9.]/g, ''));
                return w >= min && w <= max;
            });
        }

        // Apply Sorting
        if (sortBy === 'price-low') list.sort((a,b) => a.price - b.price);
        if (sortBy === 'price-high') list.sort((a,b) => b.price - a.price);
        if (sortBy === 'grossing') list.sort((a,b) => b.sales - a.sales);
        if (sortBy === 'rating') list.sort((a,b) => b.rating - a.rating);

        return list;
    }, [data, priceRange, inStockOnly, sortBy, externalWeight, searchQuery]);

    const handleReset = () => {
        setCategory('All');
        setPriceRange(5000);
        setInStockOnly(false);
        setBy('featured');
        if (onResetAll) onResetAll();
    };

    const handleAdd = (product) => {
        addToCart({
            id: product.id,
            name: product.title,
            price: product.price,
            image: product.image,
            sku: product.sku
        });
        setAddedIds(prev => [...prev, product.id]);
        setTimeout(() => setAddedIds(prev => prev.filter(id => id !== product.id)), 2000);
    };

    return (
        <div className="b2b-products-layout">
            <aside className="b2b-sidebar-filters">
                <div className="filter-headline">
                    <span><Filter size={18} /> Filters</span>
                    <button className="reset-filter-btn" onClick={handleReset}>
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>

                <div className="filter-group">
                    <span className="filter-title">Category</span>
                    <ul className="b2b-category-list">
                        <li 
                            className={category === 'All' ? 'active' : ''} 
                            onClick={() => { setCategory('All'); onCategoryChange && onCategoryChange('All'); }}
                        >
                            All Categories
                        </li>
                        {dbCategories.map(cat => (
                            <li 
                                key={cat._id} 
                                className={category === cat.name ? 'active' : ''}
                                onClick={() => { setCategory(cat.name); onCategoryChange && onCategoryChange(cat.name); }}
                            >
                                {cat.name}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="filter-group">
                    <span className="filter-title">Max Price: ₹{priceRange}</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="5000" 
                        step="100"
                        value={priceRange} 
                        onChange={(e) => setPriceRange(parseInt(e.target.value))}
                        className="price-slider"
                    />
                </div>

                <div className="filter-group">
                    <label className="checkbox-filter">
                        <input 
                            type="checkbox" 
                            checked={inStockOnly}
                            onChange={(e) => setInStockOnly(e.target.checked)}
                        />
                        <span className="filter-title" style={{margin:0}}>In Stock Only</span>
                    </label>
                </div>
            </aside>

            <main className="b2b-products-grid-area">
                <div className="grid-header">
                    <div>
                        <h2 className="grid-title">{category === 'All' ? 'All Inventory' : category}</h2>
                        <div className="grid-stats">{products.length} professional units available</div>
                    </div>
                    
                    <div className="grid-controls">
                        <select 
                            className="b2b-sort-dropdown"
                            value={sortBy}
                            onChange={(e) => setBy(e.target.value)}
                        >
                            <option value="featured">Featured</option>
                            <option value="grossing">Top Grossing</option>
                            <option value="rating">Top Rated</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading-state">Syncing warehouse data...</div>
                ) : (
                    <div className="b2b-grid">
                        {products.length > 0 ? (
                            products.map(product => {
                                const inCart = cartItems.find(item => item.product.id === product.id);
                                return (
                                    <ProductCard 
                                        key={product.id}
                                        product={product}
                                        inCart={inCart}
                                        isInWishlist={isInWishlist(product.id)}
                                        onToggleWishlist={toggleWishlist}
                                        onAddToCart={handleAdd}
                                        onUpdateQuantity={updateQuantity}
                                        isAdded={addedIds.includes(product.id)}
                                    />
                                );
                            })
                        ) : (
                            <div className="no-products-msg">
                                <RotateCcw size={40} />
                                <p>No products found matching your active filters.</p>
                                <button onClick={handleReset}>Clear All Filters</button>
                            </div>
                        )}
                    </div>
                )}

                {hasNextPage && products.length > 0 && (
                    <div className="load-more-container">
                        <button 
                            className="b2b-load-more" 
                            onClick={() => fetchNextPage()} 
                            disabled={isFetchingNextPage}
                        >
                            {isFetchingNextPage ? 'Fetching...' : 'Load More Products'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default DropshipProducts;
