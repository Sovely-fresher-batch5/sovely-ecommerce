import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getDropshipProducts } from '../data/productData';

const products = getDropshipProducts();

function DropshipProducts() {
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', ...new Set(products.map((p) => p.category))];

    const filteredProducts = activeCategory === 'All'
        ? products
        : products.filter((p) => p.category === activeCategory);

    return (
        <section className="dropship-section">
            <div className="section-header dropship-header">
                <h2 className="section-title">Wholesale Products</h2>
                <p className="section-subtitle">High-margin products ready for your store</p>
            </div>

            <div className="dropship-layout">
                <aside className="dropship-filters">
                    <div className="filter-group">
                        <h4 className="filter-title">Categories</h4>
                        <ul className="filter-list">
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <label>
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={activeCategory === cat}
                                            onChange={() => setActiveCategory(cat)}
                                        />
                                        {' '}{cat}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="filter-group">
                        <h4 className="filter-title">Shipping Time</h4>
                        <ul className="filter-list">
                            <li><label><input type="checkbox" /> 3-5 days (Local)</label></li>
                            <li><label><input type="checkbox" /> 7-14 days</label></li>
                            <li><label><input type="checkbox" /> 10-20 days</label></li>
                        </ul>
                    </div>

                    <div className="filter-group">
                        <h4 className="filter-title">Price Range</h4>
                        <div className="price-inputs">
                            <input type="number" placeholder="Min" className="form-input" />
                            <span>-</span>
                            <input type="number" placeholder="Max" className="form-input" />
                        </div>
                    </div>

                    <button className="btn-primary filter-apply-btn">Apply Filters</button>
                </aside>

                <div className="dropship-grid">
                    {filteredProducts.map(product => (
                        <div className="dropship-card" key={product.id}>
                            <Link to={`/product/${product.id}`} className="card-image-placeholder" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <span className="badge stock-badge">{product.stock > 30 ? 'High' : product.stock > 10 ? 'Medium' : 'Low'} Stock</span>
                            </Link>
                            <div className="card-content">
                                <span className="product-category">{product.category}</span>
                                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <h3 className="product-name">{product.name}</h3>
                                </Link>
                                <p className="product-sku-text">SKU: {product.skuId}</p>
                                <div className="product-meta">
                                    <span className="product-rating">★ {product.rating}</span>
                                    <span className="product-shipping">🚚 {product.shipping}</span>
                                </div>
                                <div className="card-footer">
                                    <span className="product-price">{product.price}</span>
                                    <button className="btn-secondary btn-sm">Import</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default DropshipProducts;
