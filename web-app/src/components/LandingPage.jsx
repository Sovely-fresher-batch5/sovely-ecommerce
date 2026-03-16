import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from './Hero';
import DropshipProducts from './DropshipProducts';
import './LandingPage.css';

function LandingPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const productsRef = useRef(null);
    const [searchParams] = useSearchParams();
    const globalSearchQuery = searchParams.get('search') || '';

    // Quick categories for the pill navigation
    const quickCategories = ['All', 'Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports'];

    const handleSelectCategory = (cat) => {
        setSelectedCategory(cat);
        if (productsRef.current) {
            productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const scrollToProducts = () => {
        if (productsRef.current) {
            productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="landing-page">
            {/* 1. Trust Banner: High Conversion Element */}
            <div className="trust-banner">
                <span className="trust-item">🚚 Free Shipping over $50</span>
                <span className="trust-item">🛡️ 30-Day Guarantee</span>
                <span className="trust-item">💳 Secure Checkout</span>
            </div>

            <main className="main-content">
                <Hero onShopNow={scrollToProducts} />
                
                {/* 2. Category Pills: Functional, easy filtering without menus */}
                <div className="category-navigation-wrapper">
                    <div className="category-pills">
                        {quickCategories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => handleSelectCategory(cat)}
                                className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Product Grid Area */}
                <div ref={productsRef} className="products-container-wrapper">
                    <div className="products-header">
                        <h2 className="products-title">
                            {selectedCategory === 'All' ? 'Trending Right Now' : `${selectedCategory} Collection`}
                        </h2>
                    </div>
                    
                    <DropshipProducts 
                        externalCategory={selectedCategory} 
                        onCategoryChange={setSelectedCategory} 
                        globalSearchQuery={globalSearchQuery}
                    />
                </div>
            </main>
        </div>
    );
}

export default LandingPage;