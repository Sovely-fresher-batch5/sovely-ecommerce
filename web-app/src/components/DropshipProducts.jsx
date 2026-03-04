import React, { useState } from 'react';

// Placeholder data for dropshipping products
const products = [
    { id: 1, name: 'Minimalist Ceramic Vase', price: '$24.99', category: 'Home Decor', rating: 4.8, shipping: '7-14 days', stock: 'High' },
    { id: 2, name: 'Ergonomic Desk Chair', price: '$149.00', category: 'Furniture', rating: 4.5, shipping: '3-7 days', stock: 'Low' },
    { id: 3, name: 'Smart Fitness Tracker', price: '$45.00', category: 'Electronics', rating: 4.2, shipping: '10-20 days', stock: 'Medium' },
    { id: 4, name: 'Bamboo Cutting Board', price: '$18.50', category: 'Kitchen', rating: 4.9, shipping: '7-14 days', stock: 'High' },
    { id: 5, name: 'Wireless Earbuds', price: '$35.99', category: 'Electronics', rating: 4.4, shipping: '7-14 days', stock: 'Medium' },
    { id: 6, name: 'Yoga Mat with Alignment Lines', price: '$29.00', category: 'Fitness', rating: 4.7, shipping: '3-5 days', stock: 'High' },
    { id: 7, name: 'Portable Blender', price: '$22.00', category: 'Kitchen', rating: 4.1, shipping: '10-20 days', stock: 'Low' },
    { id: 8, name: 'LED Ring Light Set', price: '$38.50', category: 'Electronics', rating: 4.6, shipping: '3-7 days', stock: 'High' },
];

function DropshipProducts() {
    const [activeCategory, setActiveCategory] = useState('All');

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
                            <li><label><input type="radio" name="category" defaultChecked /> All</label></li>
                            <li><label><input type="radio" name="category" /> Electronics</label></li>
                            <li><label><input type="radio" name="category" /> Home Decor</label></li>
                            <li><label><input type="radio" name="category" /> Kitchen</label></li>
                            <li><label><input type="radio" name="category" /> Furniture</label></li>
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
                    {products.map(product => (
                        <div className="dropship-card" key={product.id}>
                            <div className="card-image-placeholder">
                                <span className="placeholder-text">Image</span>
                                <span className="badge stock-badge">{product.stock} Stock</span>
                            </div>
                            <div className="card-content">
                                <span className="product-category">{product.category}</span>
                                <h3 className="product-name">{product.name}</h3>
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
