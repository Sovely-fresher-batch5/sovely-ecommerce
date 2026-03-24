import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { AlertCircle, Search, Download, Upload, Filter, Eye, RotateCcw, XCircle, CheckCircle, Loader2 } from 'lucide-react';

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
                const allOrders = response.data.data;
                const onlyNDRs = allOrders.filter(order => 
                    ['ACTION_REQUIRED', 'RTO', 'RTO_INITIATED'].includes(order.status) || 
                    order.isNDR === true
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

    const getMappedStatus = (order) => {
        if (['RTO', 'RTO_INITIATED'].includes(order.status)) return 'RTO Initiated';
        if (order.status === 'DELIVERED') return 'Delivered';
        return 'Action Required';
    };

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

    const getStatusBadge = (statusGroup) => {
        switch(statusGroup) {
            case 'Action Required':
                return <span className="status-badge" style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}><AlertCircle size={12} style={{marginRight: '4px'}}/> Action Required</span>;
            case 'Delivered':
                return <span className="status-badge status-delivered" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}><CheckCircle size={12} style={{marginRight: '4px'}}/> Delivered</span>;
            case 'RTO Initiated':
                return <span className="status-badge" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}><XCircle size={12} style={{marginRight: '4px'}}/> RTO</span>;
            default:
                return <span className="status-badge">{statusGroup}</span>;
        }
    };

    const actionRequiredCount = ndrData.filter(d => getMappedStatus(d) === 'Action Required').length;
    const deliveredCount = ndrData.filter(d => getMappedStatus(d) === 'Delivered').length;
    const rtoCount = ndrData.filter(d => getMappedStatus(d) === 'RTO Initiated').length;

    return (
        <div className="selection:bg-primary/30 flex min-h-screen flex-col bg-slate-50 font-sans">
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="section-container">
                    <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Manage NDR (Non-Delivery Report)</h1>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"><Download size={16} /> Export NDR</button>
                            <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800"><Upload size={16} /> Bulk Update</button>
                        </div>
                    </header>

                    {/* --- SUMMARY CARDS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div 
                            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-transform duration-200" 
                            onDoubleClick={() => setActiveTab('Action Required')}
                            style={{ cursor: 'pointer', border: activeTab === 'Action Required' ? '2px solid #fed7aa' : '1px solid #f1f5f9' }}
                            title="Double-click to view Action Required NDRs"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-700">Action Required</h3>
                                <AlertCircle size={20} style={{color: '#c2410c'}} />
                            </div>
                            <div className="text-3xl font-black text-slate-900 mb-1">{loading ? '-' : actionRequiredCount}</div>
                            <div className="text-xs font-bold text-orange-600">Needs immediate attention</div>
                        </div>

                        <div 
                            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-transform duration-200"
                            onDoubleClick={() => setActiveTab('Delivered')}
                            style={{ cursor: 'pointer', border: activeTab === 'Delivered' ? '2px solid #a7f3d0' : '1px solid #f1f5f9' }}
                            title="Double-click to view Delivered NDRs"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-700">Delivered</h3>
                                <CheckCircle size={20} style={{color: '#10b981'}} />
                            </div>
                            <div className="text-3xl font-black text-slate-900 mb-1">{loading ? '-' : deliveredCount}</div>
                            <div className="text-xs font-bold text-emerald-600">Successfully delivered after NDR</div>
                        </div>

                        <div 
                            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-transform duration-200"
                            onDoubleClick={() => setActiveTab('RTO Initiated')}
                            style={{ cursor: 'pointer', border: activeTab === 'RTO Initiated' ? '2px solid #fecaca' : '1px solid #f1f5f9' }}
                            title="Double-click to view RTO NDRs"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-700">RTO</h3>
                                <XCircle size={20} style={{color: '#ef4444'}} />
                            </div>
                            <div className="text-3xl font-black text-slate-900 mb-1">{loading ? '-' : rtoCount}</div>
                            <div className="text-xs font-bold text-red-600">Returned to origin</div>
                        </div>
                    </div>

                    {/* --- TAB BAR --- */}
                    <div className="mb-6 flex overflow-x-auto border-b border-slate-200">
                        {tabs.map(tab => (
                            <button 
                                key={tab} 
                                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* --- SEARCH & FILTERS --- */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row">
                        <div className="focus-within:border-primary focus-within:ring-primary flex flex-1 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all focus-within:ring-1">
                            <Search size={18} className="text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by Order ID, AWB, or Customer..." 
                                className="ml-3 w-full border-none text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                            <Filter size={16} /> Advanced Filters
                        </button>
                    </div>

                    {/* --- DATA TABLE --- */}
                    <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                        {error && <div className="bg-red-50 border-b border-red-200 p-4 text-center text-sm font-bold text-red-600">{error}</div>}
                        
                        <div className="relative min-h-[300px] overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">NDR ID & AWB</th>
                                        <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">Order Info</th>
                                        <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">Customer Details</th>
                                        <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">Reason & Courier</th>
                                        <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase text-center">Attempts</th>
                                        <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">Status</th>
                                        <th className="p-4 text-xs font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="p-16 text-center">
                                                <Loader2 size={24} className="mx-auto animate-spin text-slate-400" />
                                                <p className="mt-2 text-sm font-medium text-slate-500">Scanning courier databases...</p>
                                            </td>
                                        </tr>
                                    ) : filteredNDR.length > 0 ? (
                                        filteredNDR.map((item) => {
                                            const mappedGroup = getMappedStatus(item);
                                            return (
                                                <tr key={item._id} className="transition-colors hover:bg-slate-50/50">
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-900">NDR-{item.orderId?.split('-')[1] || '001'}</div>
                                                        <div className="mt-1 text-[11px] font-bold text-slate-400">{item.tracking?.trackingNumber || 'Awaiting AWB'}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-primary cursor-pointer">{item.orderId}</div>
                                                        <div className="mt-1 text-[11px] font-medium text-slate-500">{new Date(item.createdAt).toLocaleString()}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-900">{item.customerId?.name || 'Unknown'}</div>
                                                        <div className="mt-1 text-[11px] font-medium text-slate-500">{item.customerId?.email}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-900">{item.ndrReason || "Delivery attempt failed."}</div>
                                                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                                            {item.tracking?.courierName || "Standard Courier"}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                                                            {item.ndrAttempts || 1}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">{getStatusBadge(mappedGroup)}</td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center gap-2">
                                                            {mappedGroup === 'Action Required' && (
                                                                <>
                                                                    <button title="Request Re-attempt" className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700">
                                                                        <RotateCcw size={16} />
                                                                    </button>
                                                                    <button title="Initiate RTO" className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700">
                                                                        <XCircle size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button title="View Details" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 shadow-sm">
                                                                <Eye size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="p-16 text-center">
                                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                                    <AlertCircle size={24} />
                                                </div>
                                                <div className="text-base font-bold text-slate-900">No NDR orders found</div>
                                                <div className="mt-1 text-sm text-slate-500">There are no Non-Delivery Reports matching your current filters.</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ManageNDR;