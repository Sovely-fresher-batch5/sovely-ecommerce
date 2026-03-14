import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { Search, Download, Loader2 } from 'lucide-react';
import './Dashboard.css';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    withCredentials: true
});

function ManageOrders() {
    // 1. Restored the exact original B2B tabs
    const tabs = ['Draft', 'Confirmed', 'Shipped', 'Closed', 'Delivered', 'Cancelled', 'RTO', 'All Orders', 'Profit', 'Upcoming Estimate Profit'];

    const [activeTab, setActiveTab] = useState('All Orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                // 2. Security Fix: Fetching ONLY the logged-in B2B user's orders
                const response = await api.get('/orders');
                setOrders(response.data.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch orders", err);
                setError(err.response?.data?.message || "Failed to load orders. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Helper to map your UI tabs to backend Order Statuses
    const getStatusForTab = (tabName) => {
        switch(tabName) {
            case 'Confirmed': return 'PENDING'; // Or PROCESSING depending on your flow
            case 'Shipped': return 'SHIPPED';
            case 'Delivered': return 'DELIVERED';
            case 'Cancelled': return 'CANCELLED';
            case 'Draft': return 'DRAFT';
            case 'Closed': return 'CLOSED';
            case 'RTO': return 'RTO';
            default: return 'ALL';
        }
    };

    const filteredOrders = orders.filter(order => {
        const targetStatus = getStatusForTab(activeTab);
        
        // Handle specialized tabs that don't directly map to a single status
        if (activeTab === 'Profit' || activeTab === 'Upcoming Estimate Profit') return true; 

        const matchesTab = targetStatus === 'ALL' || order.status === targetStatus;
        const matchesSearch = 
            order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            order.tracking?.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesTab && matchesSearch;
    });

    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-viewport">
                <Navbar />
                <main className="content-area dashboard-page">
                    <div className="section-container">
                        <header className="dashboard-header">
                            <h1 className="dashboard-title">Manage Orders</h1>
                            <button className="premium-btn export-btn">
                                <Download size={16} /> Export {activeTab !== 'All Orders' ? activeTab : 'Data'}
                            </button>
                        </header>

                        <div className="dashboard-tabs-container">
                            <div className="dashboard-tabs">
                                {tabs.map((tab, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setActiveTab(tab)}
                                        className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="dash-actions-row">
                            <div className="dash-search-group">
                                <input 
                                    type="text" 
                                    placeholder="Search Order ID, AWB..." 
                                    className="search-input-pill"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button className="dash-search-btn">
                                    <Search size={16} /> Search
                                </button>
                            </div>
                        </div>

                        <div className="table-container dashboard-card">
                            {error && <div style={{ padding: '16px', color: '#dc2626', background: '#fef2f2', textAlign: 'center', borderBottom: '1px solid #fecaca' }}>{error}</div>}
                            
                            <table className="dash-table">
                                <thead>
                                    <tr>
                                        {/* 3. Restored the exact original B2B columns */}
                                        <th>Wukusy Id</th>
                                        <th>Order No</th>
                                        <th>Order Date</th>
                                        <th>Product Details</th>
                                        <th>Payment</th>
                                        <th>Customer Details</th>
                                        <th>Order Status</th>
                                        <th>Shipment Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                                                <p style={{ marginTop: '10px', color: '#64748b' }}>Loading orders...</p>
                                            </td>
                                        </tr>
                                    ) : filteredOrders.length === 0 ? (
                                        <tr className="empty-row">
                                            <td colSpan="8">No orders found for this category or search criteria.</td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map(order => (
                                            <tr key={order._id}>
                                                <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                    {/* Fallback to orderId if Wukusy mapping isn't established in DB yet */}
                                                    {order.cartId || order.orderId} 
                                                </td>
                                                <td style={{ fontWeight: '600', color: '#1e293b' }}>{order.orderId}</td>
                                                <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                
                                                <td>
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                                            <span style={{ fontWeight: '500' }}>{item.sku}</span> (x{item.qty})
                                                        </div>
                                                    ))}
                                                </td>
                                                
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>₹{order.totalAmount?.toLocaleString('en-IN') || 0}</div>
                                                    <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>
                                                        {order.paymentMethod}
                                                    </span>
                                                </td>
                                                
                                                <td>
                                                    {/* B2B End-Customer details. (Currently mapped to the user who placed it, until end-customer logic is added to the backend) */}
                                                    <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>{order.customerId?.name || 'Standard Client'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.customerId?.email}</div>
                                                </td>
                                                
                                                <td>
                                                    <span style={{ 
                                                        background: order.status === 'PENDING' ? '#fef9c3' : order.status === 'SHIPPED' ? '#e0f2fe' : '#f1f5f9', 
                                                        color: order.status === 'PENDING' ? '#854d0e' : order.status === 'SHIPPED' ? '#0369a1' : '#475569', 
                                                        padding: '4px 10px', 
                                                        borderRadius: '20px', 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: '600' 
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                
                                                <td>
                                                    {order.tracking?.trackingNumber ? (
                                                        <div style={{ fontSize: '0.85rem' }}>
                                                            <strong>{order.tracking.courierName}</strong><br/>
                                                            <span style={{ color: '#64748b' }}>{order.tracking.trackingNumber}</span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Pending Update</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}

export default ManageOrders;