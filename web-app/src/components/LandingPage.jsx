import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Hero from './Hero';
import Categories from './Categories';
import BestDeals from './BestDeals';
import DropshipProducts from './DropshipProducts';
import Services from './Services';
import Footer from './Footer';
import './LandingPage.css';

function LandingPage() {
    const [selectedCat, setSelectedCat] = useState('All');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const productsRef = useRef(null);
    const [searchParams] = useSearchParams();
    const globalSearchQuery = searchParams.get('search') || '';

    const toggleSidebar = () => setIsSidebarOpen(v => !v);
    const closeSidebar = () => setIsSidebarOpen(false);

    // Called when a category is clicked anywhere (navbar or categories section)
    const handleSelectCategory = (cat) => {
        setSelectedCategory(cat);
        // Smooth scroll to the products section
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
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            <Navbar onToggleSidebar={toggleSidebar} onSelectCategory={handleSelectCategory} />

            <main className="main-content">
                <Hero onShopNow={scrollToProducts} />
                <Categories onSelectCategory={handleSelectCategory} />
                <BestDeals />
                <div ref={productsRef}>
                    <DropshipProducts externalCategory={selectedCat} onCategoryChange={setSelectedCat} globalSearchQuery={globalSearchQuery} />
                </div>
                <Services />
            </main>

            <Footer />
        </div>
    );
}

export default LandingPage;
