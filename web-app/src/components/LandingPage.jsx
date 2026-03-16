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
            <div className="trust-banner" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 'clamp(1rem, 4vw, 3rem)', 
                padding: '12px 20px', 
                background: '#f8fafc', 
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.875rem', 
                fontWeight: '600',
                color: '#334155',
                flexWrap: 'wrap'
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🚚 Free Shipping over $50</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🛡️ 30-Day Guarantee</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>💳 Secure Checkout</span>
            </div>

            <main className="main-content">
                <Hero onShopNow={scrollToProducts} />
                
                {/* 2. Category Pills: Functional, easy filtering without menus */}
                <div className="category-navigation" style={{ padding: '30px 20px 10px', maxWidth: '1400px', margin: '0 auto' }}>
                    <div className="category-pills" style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        overflowX: 'auto', 
                        paddingBottom: '10px',
                        scrollbarWidth: 'none' // Hides scrollbar on Firefox
                    }}>
                        {quickCategories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => handleSelectCategory(cat)}
                                style={{ 
                                    padding: '8px 20px', 
                                    borderRadius: '30px', 
                                    border: '1px solid #e2e8f0', 
                                    background: selectedCategory === cat ? '#0f172a' : '#fff', 
                                    color: selectedCategory === cat ? '#fff' : '#475569', 
                                    cursor: 'pointer', 
                                    whiteSpace: 'nowrap',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Product Grid Area */}
                <div ref={productsRef} className="products-container" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', minHeight: '60vh' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a' }}>
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