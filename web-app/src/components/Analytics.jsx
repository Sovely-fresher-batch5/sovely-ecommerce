import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, AlertCircle, ShoppingCart } from 'lucide-react';
import './Dashboard.css';

function Analytics() {
    // Mock data for the dashboard based on screenshot
    const stats = [
        { label: 'All Orders', count: 34, icon: ShoppingCart, color: '#6366f1' },
        { label: 'Drafts Orders', count: 0, icon: AlertCircle, color: '#94a3b8' },
        { label: 'Confirmed', count: 0, icon: Package, color: '#10b981' },
        { label: 'RTO Orders', count: 0, icon: Package, color: '#f59e0b' },
        { label: 'Shipped Orders', count: 26, icon: Package, color: '#3b82f6' },
        { label: 'Delivered Orders', count: 6, icon: Package, color: '#10b981' },
        { label: 'Cancelled Orders', count: 2, icon: AlertCircle, color: '#ef4444' },
        { label: 'NDR Orders', count: 0, icon: AlertCircle, color: '#f43f5e' },
    ];

    const profits = [
        { label: 'Gross Profit', value: '₹ 3,45,360', icon: DollarSign, color: '#10b981' },
        { label: 'Upcoming Estimated Profit', value: '₹ 3,808', icon: DollarSign, color: '#f59e0b' },
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
                                    <BarChart3 size={18} /> March 5, 2026 - March 12, 2026
                                </div>
                                <button className="premium-btn">
                                    Refresh Data
                                </button>
                            </div>
                        </header>

                        <div className="stats-grid">
                            {stats.map((stat, i) => (
                                <div key={i} className="stat-card">
                                    <div className="stat-info">
                                        <h3 className="stat-count">{stat.count}</h3>
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
                                        <h3 className="profit-value">{profit.value}</h3>
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
                                {/* Simple CSS-based bar chart for visual effect */}
                                <div className="bar-chart-mock">
                                    {[30, 80, 60, 110, 0, 0, 10, 50, 30, 30, 100, 40, 30, 40, 40, 60].map((h, i) => (
                                        <div key={i} className="bar-wrapper">
                                            <div className="bar" style={{height: `${h}px`}}></div>
                                            <span className="bar-label">{25 + i}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="chart-legend">
                                    <span className="legend-item"><span className="dot prepaid"></span> Prepaid Order</span>
                                    <span className="legend-item"><span className="dot cod"></span> COD Order</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}

export default Analytics;
