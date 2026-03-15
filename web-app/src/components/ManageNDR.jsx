import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { AlertCircle, Search, Download, Upload, Filter, Eye, RotateCcw, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import './Dashboard.css';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    withCredentials: true
});

function ManageNDR() {
    const tabs = ['Action Required', 'Delivered', 'RTO Initiated', 'All NDRs'];

    const [activeTab, setActiveTab] = useState('Action Required');
    const [searchQuery, setSearchQuery] = useState('');
    const [ndrData, setNdrData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNDROrders = async () => {
            try {
                setLoading(true);
                const response = await api.get('/orders');
                
                // FILTER: We only want orders that are actually NDRs. 
                // Since the DB doesn't have an explicit 'isNDR' flag yet, we filter by NDR-specific statuses.
                const allOrders = response.data.data;
                const onlyNDRs = allOrders.filter(order => 
                    ['ACTION_REQUIRED', 'RTO', 'RTO_INITIATED'].includes(order.status) || 
                    order.isNDR === true // Future-proofing for when you update the backend
                );
                
                setNdrData(onlyNDRs);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch NDR orders", err);
                setError(err.response?.data?.message || "Failed to load NDR data. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchNDROrders();
    }, []);

    // Map Backend Status to Frontend Tab logic
    const getMappedStatus = (order) => {
        if (['RTO', 'RTO_INITIATED'].includes(order.status)) return 'RTO Initiated';
        if (order.status === 'DELIVERED') return 'Delivered';
        return 'Action Required'; // Default catch-all for failed deliveries
    };

    // Apply Tab & Search Filtering
    const filteredNDR = ndrData.filter(item => {
        const mappedStatus = getMappedStatus(item);
        const matchesTab = activeTab === 'All NDRs' || mappedStatus === activeTab;
        
        const searchTarget = searchQuery.toLowerCase();
        const matchesSearch = 
            item.orderId?.toLowerCase().includes(searchTarget) ||
            item.tracking?.trackingNumber?.toLowerCase().includes(searchTarget) ||
            item.customerId?.name?.toLowerCase().includes(searchTarget);
        
        return matchesTab && matchesSearch;
    });

    // Helper for Status Badges
    const getStatusBadge = (statusGroup) => {
        switch(statusGroup) {
            case 'Action Required':
                return <span className="status-badge" style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', display: 'inline-flex', alignItems: 'center' }}><AlertCircle size={12} style={{marginRight: '4px'}}/> Action Required</span>;
            case 'Delivered':
                return <span className="status-badge status-delivered" style={{ display: 'inline-flex', alignItems: 'center' }}><CheckCircle size={12} style={{marginRight: '4px'}}/> Delivered</span>;
            case 'RTO Initiated':
                return <span className="status-badge" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center' }}><XCircle size={12} style={{marginRight: '4px'}}/> RTO</span>;
            default:
                return <span className="status-badge">{statusGroup}</span>;
        }
    };

    // Calculate dynamic stats for the summary cards
    const actionRequiredCount = ndrData.filter(d => getMappedStatus(d) === 'Action Required').length;
    const deliveredCount = ndrData.filter(d => getMappedStatus(d) === 'Delivered').length;
    const rtoCount = ndrData.filter(d => getMappedStatus(d) === 'RTO Initiated').length;

    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-viewport">
                <Navbar />
                <main className="content-area dashboard-page">
                    <div className="section-container">
                        <header className="dashboard-header">
                            <h1 className="dashboard-title">Manage NDR (Non-Delivery Report)</h1>
                            <div className="action-buttons-group">
                                <button className="dash-secondary-btn"><Download size={16} /> Export NDR</button>
                                <button className="premium-btn"><Upload size={16} /> Bulk Update</button>
                            </div>
                        </header>

                        {/* --- SUMMARY CARDS (With Double Click Navigation) --- */}
                        <div className="dashboard-stats-grid" style={{ marginBottom: '24px' }}>
                            <div 
                                className="stat-card" 
                                onClick={() => setActiveTab('Action Required')}
                                style={{ cursor: 'pointer', transition: 'transform 0.2s', border: activeTab === 'Action Required' ? '1px solid #fed7aa' : '' }}
                                title="Double-click to view Action Required NDRs"
                            >
                                <div className="stat-card-header">
                                    <h3 className="stat-title">Action Required</h3>
                                    <AlertCircle size={20} className="stat-icon" style={{color: '#c2410c'}} />
                                </div>
                                <div className="stat-value">{loading ? '-' : actionRequiredCount}</div>
                                <div className="stat-trend" style={{color: '#c2410c'}}>Needs immediate attention</div>
                            </div>

                            <div 
                                className="stat-card"
                                onClick={() => setActiveTab('Delivered')}
                                style={{ cursor: 'pointer', transition: 'transform 0.2s', border: activeTab === 'Delivered' ? '1px solid #a7f3d0' : '' }}
                                title="Double-click to view Delivered NDRs"
                            >
                                <div className="stat-card-header">
                                    <h3 className="stat-title">Delivered</h3>
                                    <CheckCircle size={20} className="stat-icon" style={{color: '#10b981'}} />
                                </div>
                                <div className="stat-value">{loading ? '-' : deliveredCount}</div>
                                <div className="stat-trend trend-up">Successfully delivered after NDR</div>
                            </div>

                            <div 
                                className="stat-card"
                                onClick={() => setActiveTab('RTO Initiated')}
                                style={{ cursor: 'pointer', transition: 'transform 0.2s', border: activeTab === 'RTO Initiated' ? '1px solid #fecaca' : '' }}
                                title="Double-click to view RTO NDRs"
                            >
                                <div className="stat-card-header">
                                    <h3 className="stat-title">RTO</h3>
                                    <XCircle size={20} className="stat-icon" style={{color: '#ef4444'}} />
                                </div>
                                <div className="stat-value">{loading ? '-' : rtoCount}</div>
                                <div className="stat-trend trend-down">Returned to origin</div>
                            </div>
                        </div>

                        {/* --- TAB BAR --- */}
                        <div className="dashboard-tabs-container">
                            <div className="dashboard-tabs">
                                {tabs.map(tab => (
                                    <button 
                                        key={tab} 
                                        className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* --- SEARCH & FILTERS --- */}
                        <div className="dash-actions-row">
                            <div className="dash-search-group">
                                <input 
                                    type="text" 
                                    placeholder="Search by Order ID, AWB, or Customer..." 
                                    className="search-input-pill"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ width: '300px' }}
                                />
                                <button className="dash-search-btn">
                                    <Search size={16} /> Search
                                </button>
                            </div>
                            <button className="dash-filter-btn">
                                <Filter size={16} /> Advanced Filters
                            </button>
                        </div>

                        {/* --- DATA TABLE --- */}
                        <div className="table-container dashboard-card">
                            {error && <div style={{ padding: '16px', color: '#dc2626', background: '#fef2f2', textAlign: 'center', borderBottom: '1px solid #fecaca' }}>{error}</div>}
                            
                            <table className="dash-table">
                                <thead>
                                    <tr>
                                        <th>NDR ID & AWB</th>
                                        <th>Order Info</th>
                                        <th>Customer Details</th>
                                        <th>Reason & Courier</th>
                                        <th>Attempts</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                                                <p style={{ marginTop: '10px', color: '#64748b' }}>Scanning courier databases...</p>
                                            </td>
                                        </tr>
                                    ) : filteredNDR.length > 0 ? (
                                        filteredNDR.map((item) => {
                                            const mappedGroup = getMappedStatus(item);
                                            return (
                                                <tr key={item._id}>
                                                    <td>
                                                        {/* Generate a faux NDR ID since we don't have one in DB yet */}
                                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>NDR-{item.orderId.split('-')[1]}</div>
                                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                                            {item.tracking?.trackingNumber || 'Awaiting AWB'}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600, color: '#3b82f6', cursor: 'pointer' }}>{item.orderId}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{new Date(item.createdAt).toLocaleString()}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 500, color: '#1e293b' }}>{item.customerId?.name || 'Unknown'}</div>
                                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{item.customerId?.email}</div>
                                                    </td>
                                                    <td>
                                                        {/* Fallbacks for Reason since DB lacks it right now */}
                                                        <div style={{ fontWeight: 500, color: '#1e293b' }}>{item.ndrReason || "Delivery attempt failed."}</div>
                                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <span style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6'}}></span>
                                                            {item.tracking?.courierName || "Standard Courier"}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{ 
                                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                            width: '24px', height: '24px', borderRadius: '50%', 
                                                            backgroundColor: '#f1f5f9', fontSize: '13px', fontWeight: 600, color: '#475569'
                                                        }}>
                                                            {item.ndrAttempts || 1}
                                                        </span>
                                                    </td>
                                                    <td>{getStatusBadge(mappedGroup)}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                            {mappedGroup === 'Action Required' && (
                                                                <>
                                                                    <button title="Request Re-attempt" style={{ background: '#ecfdf5', color: '#10b981', border: '1px solid #10b981', padding: '6px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#d1fae5'} onMouseOut={e => e.currentTarget.style.background='#ecfdf5'}>
                                                                        <RotateCcw size={16} />
                                                                    </button>
                                                                    <button title="Initiate RTO" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#fee2e2'} onMouseOut={e => e.currentTarget.style.background='#fef2f2'}>
                                                                        <XCircle size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button title="View Details" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#f1f5f9'} onMouseOut={e => e.currentTarget.style.background='#f8fafc'}>
                                                                <Eye size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{padding: '60px', textAlign: 'center', color: '#64748b'}}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                    <AlertCircle size={32} style={{ color: '#cbd5e1' }} />
                                                    <div style={{ fontSize: '16px', fontWeight: 500 }}>No NDR orders found</div>
                                                    <div style={{ fontSize: '14px' }}>There are no Non-Delivery Reports matching your current filters.</div>
                                                </div>
                                            </td>
                                        </tr>
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

export default ManageNDR;