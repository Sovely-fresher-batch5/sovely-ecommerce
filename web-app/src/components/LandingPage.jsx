import React, { useState, useRef } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import DropshipProducts from './DropshipProducts';
import Footer from './Footer';
import './LandingPage.css';

function LandingPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const productsRef = useRef(null);

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
            <Navbar onSelectCategory={handleSelectCategory} />
            
            <main className="main-content">
                <Hero onShopNow={scrollToProducts} />
                <div ref={productsRef}>
                    <DropshipProducts 
                        externalCategory={selectedCategory} 
                        onCategoryChange={setSelectedCategory} 
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default LandingPage;