import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { AlertCircle, Search, Download, Upload, Filter, Eye, RotateCcw, XCircle, CheckCircle } from 'lucide-react';
import './Dashboard.css';

// Dummy NDR Data
const dummyNDR = [
    {
        id: "NDR-827491",
        awb: "AWB123456789",
        orderId: "ORD-2023-1001",
        orderDate: "2023-10-25 10:30 AM",
        customer: {
            name: "Amit Sharma",
            phone: "+91 9876543210",
            city: "New Delhi, Delhi"
        },
        courier: "Delhivery",
        reason: "Customer completely refused delivery.",
        status: "Action Required",
        attempts: 1,
    },
    {
        id: "NDR-827492",
        awb: "AWB987654321",
        orderId: "ORD-2023-1002",
        orderDate: "2023-10-24 02:15 PM",
        customer: {
            name: "Priya Singh",
            phone: "+91 9123456780",
            city: "Mumbai, Maharashtra"
        },
        courier: "Ecom Express",
        reason: "Address is incomplete/incorrect.",
        status: "Action Required",
        attempts: 2,
    },
    {
        id: "NDR-827493",
        awb: "AWB456123789",
        orderId: "ORD-2023-1005",
        orderDate: "2023-10-22 11:45 AM",
        customer: {
            name: "Rahul Verma",
            phone: "+91 9988776655",
            city: "Bangalore, Karnataka"
        },
        courier: "XpressBees",
        reason: "Customer not available at location.",
        status: "Delivered",
        attempts: 3,
    },
    {
        id: "NDR-827494",
        awb: "AWB321654987",
        orderId: "ORD-2023-1008",
        orderDate: "2023-10-20 09:20 AM",
        customer: {
            name: "Sneha Reddy",
            phone: "+91 9012345678",
            city: "Hyderabad, Telangana"
        },
        courier: "BlueDart",
        reason: "Customer requested future delivery",
        status: "RTO Initiated",
        attempts: 3,
    }
];

function ManageNDR() {
    const [activeTab, setActiveTab] = useState('Action Required');
    const [searchQuery, setSearchQuery] = useState('');
    const [ndrData, setNdrData] = useState(dummyNDR);

    const tabs = ['Action Required', 'Delivered', 'RTO Initiated', 'All NDRs'];

    // Filter logic
    const filteredNDR = ndrData.filter(item => {
        const matchesTab = activeTab === 'All NDRs' || item.status.includes(activeTab) || (activeTab === 'RTO Initiated' && item.status.includes('RTO'));
        const matchesSearch = 
            item.awb.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesTab && matchesSearch;
    });

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Action Required':
                return <span className="status-badge" style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}><AlertCircle size={12} style={{marginRight: '4px'}}/> Action Required</span>;
            case 'Delivered':
                return <span className="status-badge status-delivered"><CheckCircle size={12} style={{marginRight: '4px'}}/> Delivered</span>;
            case 'RTO Initiated':
                return <span className="status-badge" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}><XCircle size={12} style={{marginRight: '4px'}}/> RTO</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };

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

                        {/* Summary Cards */}
                        <div className="dashboard-stats-grid" style={{ marginBottom: '24px' }}>
                            <div className="stat-card">
                                <div className="stat-card-header">
                                    <h3 className="stat-title">Action Required</h3>
                                    <AlertCircle size={20} className="stat-icon" style={{color: '#c2410c'}} />
                                </div>
                                <div className="stat-value">{ndrData.filter(d => d.status === 'Action Required').length}</div>
                                <div className="stat-trend" style={{color: '#c2410c'}}>Needs immediate attention</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-header">
                                    <h3 className="stat-title">Delivered</h3>
                                    <CheckCircle size={20} className="stat-icon" style={{color: '#10b981'}} />
                                </div>
                                <div className="stat-value">{ndrData.filter(d => d.status === 'Delivered').length}</div>
                                <div className="stat-trend trend-up">Successfully delivered after NDR</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-header">
                                    <h3 className="stat-title">RTO</h3>
                                    <XCircle size={20} className="stat-icon" style={{color: '#ef4444'}} />
                                </div>
                                <div className="stat-value">{ndrData.filter(d => d.status === 'RTO Initiated').length}</div>
                                <div className="stat-trend trend-down">Returned to origin</div>
                            </div>
                        </div>

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

                        <div className="table-container dashboard-card">
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
                                    {filteredNDR.length > 0 ? (
                                        filteredNDR.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.id}</div>
                                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{item.awb}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600, color: '#3b82f6', cursor: 'pointer' }}>{item.orderId}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{item.orderDate}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 500, color: '#1e293b' }}>{item.customer.name}</div>
                                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{item.customer.city}</div>
                                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{item.customer.phone}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 500, color: '#1e293b' }}>{item.reason}</div>
                                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6'}}></span>
                                                        {item.courier}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{ 
                                                        display: 'inline-flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        width: '24px', 
                                                        height: '24px', 
                                                        borderRadius: '50%', 
                                                        backgroundColor: '#f1f5f9', 
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#475569'
                                                    }}>
                                                        {item.attempts}
                                                    </span>
                                                </td>
                                                <td>{getStatusBadge(item.status)}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        {item.status === 'Action Required' && (
                                                            <>
                                                                <button title="Re-attempt" style={{ background: '#ecfdf5', color: '#10b981', border: '1px solid #10b981', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                                                                    <RotateCcw size={16} />
                                                                </button>
                                                                <button title="RTO (Return to Origin)" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                                                                    <XCircle size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button title="View Details" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                                                            <Eye size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
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
        </div>
    );
}

export default ManageNDR;
