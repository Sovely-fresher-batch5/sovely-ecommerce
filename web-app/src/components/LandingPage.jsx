import React, { useState, useRef } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Categories from './Categories';
import BestDeals from './BestDeals';
import DropshipProducts from './DropshipProducts';
import Services from './Services';
import Footer from './Footer';
import './LandingPage.css';

function LandingPage() {
    const productsRef = useRef(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedWeight, setSelectedWeight] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const scrollToProducts = () => {
        if (productsRef.current) {
            productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleSelectCategory = (cat) => {
        setSelectedCategory(cat);
        scrollToProducts();
    };

    const handleSearchSubmit = (query) => {
        setSearchQuery(query);
        setSelectedCategory('All');
        setSelectedWeight('All'); // Ensure global search is not restricted by weight
        scrollToProducts();
    };

    const handleResetAll = () => {
        setSelectedCategory('All');
        setSelectedWeight('All');
        setSearchQuery('');
    };

    const weightRanges = [
        { label: 'All Weights', value: 'All' },
        { label: '0-500 GM', value: '0-500' },
        { label: '500-1000 GM', value: '500-1000' },
        { label: '1000-2000 GM', value: '1000-2000' },
        { label: '2000-3000 GM', value: '2000-3000' },
        { label: '3000-4000 GM', value: '3000-4000' },
        { label: '4000-10000 GM', value: '4000-10000' },
    ];

    return (
        <div className="layout-container">
            <Sidebar />
            
            <div className="main-viewport">
                <Navbar 
                    onSelectCategory={handleSelectCategory} 
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSearchSubmit={handleSearchSubmit}
                />
                
                <main className="content-area">
                    <Categories 
                        activeCategory={selectedCategory}
                        onSelectCategory={handleSelectCategory} 
                    />
                    
                    <BestDeals />

                    <div className="weight-filter-container">
                        <div className="section-container">
                            <div className="weight-filter-flex">
                                <span className="filter-by-label">Filter By Weight</span>
                                <div className="weight-pills-row">
                                    {weightRanges.map((range) => (
                                        <button
                                            key={range.value}
                                            className={`weight-pill ${selectedWeight === range.value ? 'active' : ''}`}
                                            onClick={() => setSelectedWeight(range.value)}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="products-section" ref={productsRef}>
                        <DropshipProducts
                            externalCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            externalWeight={selectedWeight}
                            searchQuery={searchQuery}
                            onResetAll={handleResetAll}
                        />
                    </div>

                    <Services />
                </main>
                
                <Footer />
            </div>
        </div>
    );
}

export default LandingPage;
