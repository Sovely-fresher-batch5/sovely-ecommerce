import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import DropshipProducts from './DropshipProducts';

function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [selectedCat, setSelectedCat] = useState('All');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fafafa' }}>
            <Navbar onSelectCategory={setSelectedCat} />
            <main style={{ flex: 1, padding: '20px 0' }}>
                <DropshipProducts 
                    externalCategory={selectedCat} 
                    onCategoryChange={setSelectedCat}
                    globalSearchQuery={query}
                    customTitle={`Search Results for "${query}"`}
                    customSubtitle="Explore top matches based on your search"
                />
            </main>
            <Footer />
        </div>
    );
}

export default SearchResults;
