import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { Truck, Search, Loader2, ExternalLink } from 'lucide-react';
import './Dashboard.css';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    withCredentials: true
});

function CourierService() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await api.get('/orders');
                // Filter orders to only show those that have a courier assigned (shipped/delivered)
                // For demonstration, we'll just show all orders, but prioritize courier info
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

    const filteredOrders = orders.filter(order => {
        const query = searchQuery.toLowerCase();
        return (
            order._id.toLowerCase().includes(query) ||
            (order.tracking?.trackingNumber && order.tracking.trackingNumber.toLowerCase().includes(query)) ||
            (order.tracking?.courierName && order.tracking.courierName.toLowerCase().includes(query))
        );
    });

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="main-content">
                <Navbar />
                
                <div className="dashboard-content">
                    <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <Truck size={28} className="text-primary" />
                        <h1 style={{ margin: 0 }}>Courier Service</h1>
                    </div>
                    
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                        Track and manage courier partners for your shipments.
                    </p>

                    <div className="controls-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input 
                                type="text" 
                                placeholder="Search by Order ID or Tracking Number..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 35px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--surface-color)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            <Loader2 className="animate-spin" size={40} style={{ marginBottom: '10px', color: 'var(--primary-color)' }} />
                            <p>Loading courier data...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '15px', borderRadius: '6px', textAlign: 'center' }}>
                            {error}
                        </div>
                    ) : (
                        <div className="table-container" style={{ backgroundColor: 'var(--surface-color)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <table className="orders-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
                                        <th style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Order ID</th>
                                        <th style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Date</th>
                                        <th style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Status</th>
                                        <th style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Courier Name</th>
                                        <th style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Tracking Number</th>
                                        <th style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map(order => (
                                            <tr key={order._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                                                <td style={{ padding: '15px' }}>{order._id.substring(0, 8)}...</td>
                                                <td style={{ padding: '15px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td style={{ padding: '15px' }}>
                                                    <span className={`status-badge ${order.orderStatus.toLowerCase()}`} style={{ 
                                                        padding: '4px 8px', 
                                                        borderRadius: '4px', 
                                                        fontSize: '0.85rem',
                                                        backgroundColor: order.orderStatus === 'DELIVERED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                        color: order.orderStatus === 'DELIVERED' ? '#22c55e' : '#f59e0b'
                                                    }}>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px', fontWeight: 500 }}>
                                                    {order.tracking?.courierName || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Not assigned</span>}
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    {order.tracking?.trackingNumber || '-'}
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    {order.tracking?.trackingUrl ? (
                                                        <a 
                                                            href={order.tracking.trackingUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.9rem' }}
                                                            className="hover-underline"
                                                        >
                                                            Track <ExternalLink size={14} />
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                No courier data found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </div>
    );
}

export default CourierService;
