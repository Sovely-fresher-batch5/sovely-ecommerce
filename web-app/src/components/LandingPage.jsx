import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from './Hero';
import DropshipProducts from './DropshipProducts';
import { FileText, Truck, ShieldCheck, BadgePercent, Handshake, SlidersHorizontal, Zap } from 'lucide-react'; 

function LandingPage() {
    const productsRef = useRef(null);
    const [searchParams] = useSearchParams();
    const globalSearchQuery = searchParams.get('search') || '';

    const [b2bFilters, setB2bFilters] = useState({
        moq: 'all',          
        margin: 'all',       
        readyToShip: false,  
    });

    const scrollToProducts = () => {
        if (productsRef.current) {
            productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleFilterChange = (key, value) => {
        setB2bFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="w-full flex flex-col min-h-screen relative">

            {}
            <div className="bg-primary text-slate-100 py-2.5 px-4 text-xs md:text-sm font-medium flex justify-center gap-6 md:gap-12 flex-wrap z-20 relative shadow-sm">
                <span className="flex items-center gap-2 tracking-wide">
                    <Truck size={16} className="text-emerald-400" /> Pan-India Delivery (Tier 1-3)
                </span>
                <span className="flex items-center gap-2 tracking-wide">
                    <FileText size={16} className="text-emerald-400" /> 100% GST Input Credit
                </span>
                <span className="flex items-center gap-2 tracking-wide">
                    <Handshake size={16} className="text-emerald-400" /> Flexible Net-30 Credit Terms
                </span>
            </div>

            <main className="flex-1 w-full flex flex-col z-10">
                <Hero onShopNow={scrollToProducts} />

                {}
                <div className="bg-white border-y border-slate-200 py-10 relative z-20 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
                        <div className="flex flex-col items-center gap-3 group">
                            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm"><FileText size={24} /></div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm md:text-base">GST Invoicing</h3>
                                <p className="text-xs text-slate-500 mt-1">Claim full ITC easily</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-3 group">
                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm"><BadgePercent size={24} /></div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm md:text-base">Tiered Bulk Pricing</h3>
                                <p className="text-xs text-slate-500 mt-1">More quantity, less price</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-3 group">
                            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm"><ShieldCheck size={24} /></div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm md:text-base">Verified Suppliers</h3>
                                <p className="text-xs text-slate-500 mt-1">Quality assured sourcing</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-3 group">
                            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-sm"><Truck size={24} /></div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm md:text-base">End-to-End Logistics</h3>
                                <p className="text-xs text-slate-500 mt-1">Safe transit nationwide</p>
                            </div>
                        </div>
                    </div>
                </div>

                {}
                <div ref={productsRef} className="w-full bg-slate-50 sticky top-0 z-30 pt-8 pb-4 border-b border-slate-200/60 backdrop-blur-xl bg-slate-50/90 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                    <SlidersHorizontal className="text-primary" size={28} />
                                    Wholesale Catalog
                                </h2>
                                <p className="text-sm text-slate-500 mt-1 font-medium">Source inventory tailored to your business needs.</p>
                            </div>

                            {}
                            <div className="flex flex-wrap items-center gap-3">
                                {}
                                <select 
                                    className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 font-medium shadow-sm cursor-pointer outline-none"
                                    value={b2bFilters.moq}
                                    onChange={(e) => handleFilterChange('moq', e.target.value)}
                                >
                                    <option value="all">Any MOQ</option>
                                    <option value="under-50">Low MOQ (&lt; 50 units)</option>
                                    <option value="50-500">Medium (50 - 500 units)</option>
                                    <option value="bulk">True Bulk (500+ units)</option>
                                </select>

                                {}
                                <select 
                                    className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 font-medium shadow-sm cursor-pointer outline-none"
                                    value={b2bFilters.margin}
                                    onChange={(e) => handleFilterChange('margin', e.target.value)}
                                >
                                    <option value="all">All Profit Margins</option>
                                    <option value="high-margin">High Margin (40%+)</option>
                                </select>

                                {}
                                <button 
                                    onClick={() => handleFilterChange('readyToShip', !b2bFilters.readyToShip)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm border ${
                                        b2bFilters.readyToShip 
                                        ? 'bg-amber-100 border-amber-300 text-amber-800' 
                                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <Zap size={16} className={b2bFilters.readyToShip ? 'text-amber-600 fill-amber-600' : 'text-slate-400'} />
                                    Ready to Dispatch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {}
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {}
                    <DropshipProducts 
                        filters={b2bFilters} 
                        globalSearchQuery={globalSearchQuery}
                    />
                </div>
            </main>
        </div>
    );
}

export default LandingPage;