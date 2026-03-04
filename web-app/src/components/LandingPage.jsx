import React, { useState } from 'react';
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="landing-page">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            <Navbar onToggleSidebar={toggleSidebar} />

            <main className="main-content">
                <Hero />
                <Categories />
                <BestDeals />
                <DropshipProducts />
                <Services />
            </main>

            <Footer />
        </div>
    );
}

export default LandingPage;
