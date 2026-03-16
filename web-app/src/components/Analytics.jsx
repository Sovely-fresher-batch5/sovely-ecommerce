import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { BarChart3, DollarSign, Package, AlertCircle, ShoppingCart, Loader2 } from 'lucide-react';
import './Dashboard.css';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    withCredentials: true
});

function Analytics() {
    const [analyticsData, setAnalyticsData] = useState({
        totalOrders: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        grossProfit: 0,
        upcomingProfit: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/analytics/stats');
            if (response.data && response.data.data) {
                setAnalyticsData(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const stats = [
        { label: 'All Orders', count: analyticsData.totalOrders, icon: ShoppingCart, color: '#6366f1' },
        { label: 'Drafts Orders', count: 0, icon: AlertCircle, color: '#94a3b8' },
        { label: 'Confirmed', count: analyticsData.confirmed, icon: Package, color: '#10b981' },
        { label: 'RTO Orders', count: 0, icon: Package, color: '#f59e0b' },
        { label: 'Shipped Orders', count: analyticsData.shipped, icon: Package, color: '#3b82f6' },
        { label: 'Delivered Orders', count: analyticsData.delivered, icon: Package, color: '#10b981' },
        { label: 'Cancelled Orders', count: analyticsData.cancelled, icon: AlertCircle, color: '#ef4444' },
        { label: 'NDR Orders', count: 0, icon: AlertCircle, color: '#f43f5e' },
    ];

    const profits = [
        { label: 'Gross Profit', value: `₹ ${analyticsData.grossProfit.toLocaleString('en-IN')}`, icon: DollarSign, color: '#10b981' },
        { label: 'Upcoming Estimated Profit', value: `₹ ${analyticsData.upcomingProfit.toLocaleString('en-IN')}`, icon: DollarSign, color: '#f59e0b' },
    ];

    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-viewport">
                <Navbar />
                <main className="content-area dashboard-page">
                    <div className="section-container">
                        <header className="dashboard-header">
                            <h1 className="dashboard-title">Analytics</h1>
                            <div className="action-buttons-group">
                                <div className="dash-secondary-btn" style={{cursor: 'default'}}>
                                    <BarChart3 size={18} /> Last 7 Days
                                </div>
                                <button className="premium-btn" onClick={fetchAnalytics} disabled={loading}>
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Refresh Data"}
                                </button>
                            </div>
                        </header>

                        <div className="stats-grid">
                            {stats.map((stat, i) => (
                                <div key={i} className="stat-card">
                                    <div className="stat-info">
                                        <h3 className="stat-count">{loading ? '-' : stat.count}</h3>
                                        <p className="stat-label">{stat.label}</p>
                                    </div>
                                    <div className="stat-icon-wrapper" style={{color: stat.color}}>
                                        <stat.icon size={24} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="profit-row">
                            {profits.map((profit, i) => (
                                <div key={i} className="profit-card">
                                    <div className="profit-info">
                                        <h3 className="profit-value">{loading ? '₹ -' : profit.value}</h3>
                                        <p className="profit-label">{profit.label}</p>
                                    </div>
                                    <div className="profit-icon-wrapper" style={{color: profit.color}}>
                                        <profit.icon size={24} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="chart-section dashboard-card">
                            <h3 className="card-title">Day Wise Order</h3>
                            <div className="chart-placeholder">
                                <div className="bar-chart-mock">
                                    {[30, 80, 60, 110, 0, 0, 10, 50, 30, 30, 100, 40, 30, 40, 40, 60].map((h, i) => (
                                        <div key={i} className="bar-wrapper">
                                            <div className="bar" style={{height: `${h}px`, backgroundColor: '#3b82f6', borderRadius: '4px'}}></div>
                                            <span className="bar-label" style={{fontSize: '12px', color: '#9ca3af', marginTop: '8px', display: 'block', textAlign: 'center'}}>{25 + i}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="chart-legend" style={{display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', fontSize: '14px', color: '#6b7280'}}>
                                    <span className="legend-item" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <span className="dot prepaid" style={{width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6'}}></span> Prepaid Order
                                    </span>
                                    <span className="legend-item" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <span className="dot cod" style={{width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444'}}></span> COD Order
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .bar-chart-mock { display: flex; align-items: flex-end; gap: 8px; height: 150px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
                .bar-wrapper { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; }
                .bar { width: 100%; transition: height 0.3s ease; }
            `}} />
        </div>
    );
}

export default Analytics;