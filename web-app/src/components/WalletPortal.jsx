import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { Wallet, Search, List, ArrowUpRight, X, CreditCard, ChevronDown, CheckCircle } from 'lucide-react';
import { AuthContext } from '../AuthContext';
import './Dashboard.css';

function WalletPortal() {
    const { user, balance, refreshBalance } = useContext(AuthContext);
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
    const [showSuccessState, setShowSuccessState] = useState(false);
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // ALL, CREDIT, DEBIT
    const [filterDate, setFilterDate] = useState('ALL'); // ALL, TODAY, WEEK, MONTH
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const quickAmounts = [500, 1000, 2000, 3000, 4000, 5000];
    const location = useLocation();

    const filteredTransactions = transactions.filter(trx => {
        const matchesSearch = trx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (trx.paymentId && trx.paymentId.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = filterType === 'ALL' || trx.transactionType === filterType;
        
        let matchesDate = true;
        if (filterDate !== 'ALL') {
            const trxDate = new Date(trx.createdAt);
            const now = new Date();
            if (filterDate === 'TODAY') {
                matchesDate = trxDate.toDateString() === now.toDateString();
            } else if (filterDate === 'WEEK') {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                matchesDate = trxDate >= weekAgo;
            } else if (filterDate === 'MONTH') {
                matchesDate = trxDate.getMonth() === now.getMonth() && trxDate.getFullYear() === now.getFullYear();
            }
        }

        return matchesSearch && matchesType && matchesDate;
    });

    const handleReset = () => {
        setSearchTerm('');
        setFilterType('ALL');
        setFilterDate('ALL');
        setShowFilterDropdown(false);
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const fetchData = async () => {
        try {
            await refreshBalance();
            const historyRes = await axios.get('/wallet/transactions');
            setTransactions(historyRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching wallet data:", error);
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
        const params = new URLSearchParams(location.search);
        if (params.get('action') === 'recharge') {
            setIsRechargeModalOpen(true);
        }
    }, [location]);

    const handleRecharge = async () => {
        if (!rechargeAmount || isNaN(rechargeAmount)) return alert("Please enter a valid amount");

        try {
            const res = await loadRazorpay();
            if (!res) return alert("Razorpay SDK failed to load. Check your internet.");

            // 1. Create Order
            const { data: apiResponse } = await axios.post('/wallet/add-money', {
                amount: Number(rechargeAmount)
            });

            const { razorpayOrderId, amount, currency, invoiceId, keyId } = apiResponse.data;

            // 2. Open Widget
            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: "Sovely Marketplace",
                description: "Wallet Recharge",
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        // 3. Verify Signature
                        await axios.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            invoiceId: invoiceId
                        });
                        
                        setIsRechargeModalOpen(false);
                        setShowSuccessState(true);
                        refreshBalance(); // Update global balance
                        fetchData(); // Refresh history
                        
                        // Auto-hide success message after 5 seconds
                        setTimeout(() => setShowSuccessState(false), 5000);
                    } catch (err) {
                        const errorMsg = err.response?.data?.message || err.message || "Payment verification failed";
                        alert(`Verification Error: ${errorMsg}`);
                    }
                },
                prefill: {
                    name: user?.name || "User", 
                    email: user?.email || "user@example.com"
                },
                theme: { color: "#1b4332" }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Recharge init error:", error);
            const errorMsg = error.response?.data?.message || error.message || "Failed to initialize recharge";
            alert(`Error: ${errorMsg}`);
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
                            <div className="title-with-icon">
                                <h1 className="dashboard-title">Wallet Balance: ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h1>
                                <span className="info-icon" title="This is your current spendable balance">ⓘ</span>
                            </div>
                            <div className="action-buttons-group">
                                <button className="btn-danger-outline">Withdraw Request</button>
                                <button className="dash-secondary-btn">Remittance List</button>
                                <button className="premium-btn" onClick={() => setIsRechargeModalOpen(true)}>
                                    <CreditCard size={18} /> Recharge Wallet
                                </button>
                            </div>
                        </header>

                        <div className="dash-actions-row">
                            <div className="dash-search-group">
                                <div className="search-pill-container" style={{display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '50px', padding: '2px 4px 2px 20px', border: '1px solid #e2e8f0'}}>
                                    <Search size={16} color="#64748b" />
                                    <input 
                                        type="text" 
                                        placeholder="Search transactions..." 
                                        style={{background: 'transparent', border: 'none', padding: '10px 12px', outline: 'none', width: '250px', fontSize: '14px'}}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {(searchTerm || filterType !== 'ALL' || filterDate !== 'ALL') && (
                                        <button 
                                            onClick={handleReset}
                                            style={{background: '#e2e8f0', border: 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', marginRight: '5px', color: '#475569'}}
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                
                                <div className="filter-popover-wrapper" style={{position: 'relative'}}>
                                    <button 
                                        className="dash-secondary-btn" 
                                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                        style={{height: '42px', padding: '0 20px'}}
                                    >
                                        <List size={16} /> Filter
                                    </button>

                                    {showFilterDropdown && (
                                        <div className="filter-dropdown dashboard-card" style={{
                                            position: 'absolute', top: '100%', right: 0, marginTop: '10px', width: '300px', zIndex: 100,
                                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', padding: '20px'
                                        }}>
                                            <div className="filter-section" style={{marginBottom: '20px'}}>
                                                <h4 style={{fontSize: '12px', textTransform: 'uppercase', color: '#64748b', marginBottom: '10px'}}>Transaction Type</h4>
                                                <div style={{display: 'flex', gap: '8px'}}>
                                                    {['ALL', 'CREDIT', 'DEBIT'].map(type => (
                                                        <button 
                                                            key={type}
                                                            onClick={() => setFilterType(type)}
                                                            className={`amount-chip ${filterType === type ? 'active' : ''}`}
                                                            style={{flex: 1, fontSize: '11px'}}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="filter-section">
                                                <h4 style={{fontSize: '12px', textTransform: 'uppercase', color: '#64748b', marginBottom: '10px'}}>Date Range</h4>
                                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                                                    {['ALL', 'TODAY', 'WEEK', 'MONTH'].map(range => (
                                                        <button 
                                                            key={range}
                                                            onClick={() => setFilterDate(range)}
                                                            className={`amount-chip ${filterDate === range ? 'active' : ''}`}
                                                            style={{fontSize: '11px'}}
                                                        >
                                                            {range}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div style={{marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f1f5f9'}}>
                                                <button className="place-order-btn" style={{height: '36px', fontSize: '13px'}} onClick={() => setShowFilterDropdown(false)}>
                                                    Apply Filters
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="table-container dashboard-card">
                            {loading ? (
                                <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Loading transactions...</div>
                            ) : (
                                <table className="dash-table wallet-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Amount (₹)</th>
                                            <th>Narration</th>
                                            <th>Transaction ID</th>
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.length > 0 ? filteredTransactions.map((trx) => (
                                            <tr key={trx._id}>
                                                <td>
                                                    <span className={`badge ${trx.transactionType === 'CREDIT' ? 'badge-success' : 'badge-danger'}`} style={{
                                                        background: trx.transactionType === 'CREDIT' ? '#dcfce7' : '#fee2e2',
                                                        color: trx.transactionType === 'CREDIT' ? '#166534' : '#991b1b',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: '700'
                                                    }}>
                                                        {trx.transactionType}
                                                    </span>
                                                </td>
                                                <td className={trx.transactionType === 'CREDIT' ? 'text-success' : 'text-danger'} style={{fontWeight: '700', color: trx.transactionType === 'CREDIT' ? '#2d6a4f' : '#ef4444'}}>
                                                    {trx.transactionType === 'CREDIT' ? '+' : '-'}{trx.amount.toLocaleString('en-IN')}
                                                </td>
                                                <td>{trx.description}</td>
                                                <td style={{fontSize: '11px', color: '#64748b', fontFamily: 'monospace'}}>{trx.paymentId || 'INTERNAL'}</td>
                                                <td>{new Date(trx.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No transactions found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>

            {/* RECHARGE MODAL */}
            {isRechargeModalOpen && (
                <div className="modal-overlay" onClick={() => setIsRechargeModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="card-title" style={{margin: 0}}>Recharge Wallet</h2>
                            <button className="modal-close" onClick={() => setIsRechargeModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="recharge-input-group">
                            <p className="stat-label" style={{marginBottom: '10px'}}>Enter Amount (INR)</p>
                            <input 
                                type="number" 
                                className="recharge-input" 
                                placeholder="Recharge Amount (Min. ₹100)"
                                value={rechargeAmount}
                                onChange={(e) => setRechargeAmount(e.target.value)}
                            />
                        </div>

                        <div className="amount-chips">
                            {quickAmounts.map(amt => (
                                <button 
                                    key={amt} 
                                    className={`amount-chip ${rechargeAmount === amt.toString() ? 'active' : ''}`}
                                    onClick={() => setRechargeAmount(amt.toString())}
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>

                        <button className="place-order-btn" style={{marginTop: '10px'}} onClick={handleRecharge}>
                            Proceed to Pay ₹{rechargeAmount || '0'} <ArrowUpRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Premium Success Notification Toast */}
            {showSuccessState && (
                <div style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    zIndex: 1000,
                    animation: 'slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <div className="dashboard-card" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '16px 24px',
                        backgroundColor: '#1b4332',
                        color: 'white',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1)',
                        border: '1px solid #2d6a4f',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CheckCircle size={24} color="#52b788" />
                        </div>
                        <div>
                            <h4 style={{margin: 0, fontSize: '16px', fontWeight: 600}}>Recharge Successful!</h4>
                            <p style={{margin: 0, fontSize: '13px', opacity: 0.8}}>Your balance has been updated instantly.</p>
                        </div>
                        <button 
                            onClick={() => setShowSuccessState(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                opacity: 0.5,
                                cursor: 'pointer',
                                padding: '4px',
                                marginLeft: '10px'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .filter-dropdown {
                    animation: slideDown 0.2s ease-out;
                }
                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default WalletPortal;
