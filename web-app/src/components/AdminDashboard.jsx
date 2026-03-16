import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, Package, TrendingUp, AlertCircle, DollarSign, Edit2, Search, Filter, Upload } from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';
import BulkUpload from './BulkUpload';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    withCredentials: true
});

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders');

    // Data States
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOption, setFilterOption] = useState('ALL');
    const [priceFilter, setPriceFilter] = useState('ALL');
    const [stockFilter, setStockFilter] = useState('ALL');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Inline Editing States
    const [updatingId, setUpdatingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // ✅ NEW: Bulk Select States (Shashank)
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkStock, setBulkStock] = useState('');

    // Fetch data whenever the tab changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'overview') {
                    const [ordersRes, productsRes] = await Promise.all([
                        api.get('/orders/admin/all'),
                        api.get('/products/admin/all')
                    ]);
                    setOrders(ordersRes.data.data);
                    setProducts(productsRes.data.data);
                } else if (activeTab === 'orders') {
                    const res = await api.get('/orders/admin/all');
                    setOrders(res.data.data);
                } else if (activeTab === 'products') {
                    const res = await api.get('/products/admin/all');
                    setProducts(res.data.data);
                } else if (activeTab === 'users') {
                    const res = await api.get('/users/admin/all');
                    setUsers(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    const handleSidebarClick = (tabId) => {
        setActiveTab(tabId);
        setSearchQuery('');
        setFilterOption('ALL');
        setPriceFilter('ALL');
        setStockFilter('ALL');
        setUpdatingId(null);
        setSelectedIds([]);
        setBulkStock('');
    };

    // --- SUBMIT HANDLERS ---
    const submitOrderUpdate = async (id) => {
        setIsSaving(true);
        try {
            await api.put(`/orders/${id}/status`, { status: editForm.status, courierName: editForm.courierName, trackingNumber: editForm.trackingNumber });
            setUpdatingId(null);
            const res = await api.get('/orders/admin/all');
            setOrders(res.data.data);
        } finally { setIsSaving(false); }
    };

    const submitProductUpdate = async (id) => {
        setIsSaving(true);
        try {
            await api.put(`/products/admin/${id}`, { platformSellPrice: Number(editForm.price), stock: Number(editForm.stock), status: editForm.status });
            setUpdatingId(null);
            const res = await api.get('/products/admin/all');
            setProducts(res.data.data);
        } finally { setIsSaving(false); }
    };

    const submitUserUpdate = async (id) => {
        setIsSaving(true);
        try {
            await api.put(`/users/admin/${id}/role`, { role: editForm.role });
            setUpdatingId(null);
            const res = await api.get('/users/admin/all');
            setUsers(res.data.data);
        } finally { setIsSaving(false); }
    };

    // ✅ NEW: Bulk Action Handlers (Shashank)
    const handleSelectAll = (data) => {
        if (selectedIds.length === data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data.map(p => p._id));
        }
    };

    const handleMassDelete = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} product(s)? This cannot be undone.`)) return;
        try {
            for (const id of selectedIds) {
                await api.delete(`/products/admin/${id}`);
            }
            setSelectedIds([]);
            const res = await api.get('/products/admin/all');
            setProducts(res.data.data);
        } catch (err) {
            console.error('Mass delete error:', err);
            alert('Something went wrong during deletion. Please try again.');
        }
    };

    const handleBulkStockUpdate = async () => {
        if (!selectedIds.length || bulkStock === '') return;
        try {
            const updates = selectedIds.map(id => ({ id, stock: bulkStock }));
            await api.post('/products/admin/bulk-stock', { updates });
            setSelectedIds([]);
            setBulkStock('');
            const res = await api.get('/products/admin/all');
            setProducts(res.data.data);
        } catch (err) {
            console.error('Bulk stock update error:', err);
            alert('Something went wrong. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return { bg: '#fef9c3', text: '#854d0e' };
            case 'PROCESSING': return { bg: '#e0f2fe', text: '#075985' };
            case 'SHIPPED': return { bg: '#fef08a', text: '#ca8a04' };
            case 'DELIVERED': return { bg: '#dcfce7', text: '#166534' };
            case 'CANCELLED': return { bg: '#fee2e2', text: '#991b1b' };
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return ' ↕';
        return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    };

    const renderControls = (searchPlaceholder, filterOptions) => (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', background: '#fff', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <Search size={18} color="#94a3b8" />
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '0.95rem' }}
                />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '0 16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <Filter size={18} color="#94a3b8" style={{ marginRight: '8px' }} />
                <select
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value)}
                    style={{ border: 'none', outline: 'none', padding: '12px 0', background: 'transparent', fontSize: '0.95rem', cursor: 'pointer' }}
                >
                    <option value="ALL">All Filters</option>
                    {filterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
        </div>
    );

    // ✅ UPDATED: renderOverview — more detail (Shashank)
    const renderOverview = () => {
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalOrders = orders.length;
        const totalProducts = products.length;
        const processingCount = orders.filter(o => o.status === 'PROCESSING').length;
        const lowStockCount = products.filter(p => p.inventory?.stock > 0 && p.inventory?.stock <= 10).length;
        const outOfStockCount = products.filter(p => !p.inventory?.stock || p.inventory?.stock === 0).length;

        const statCards = [
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, bg: '#f0fdf4', iconBg: '#dcfce7', icon: <DollarSign size={22} color="#166534" /> },
            { label: 'Total Orders', value: totalOrders, bg: '#eff6ff', iconBg: '#dbeafe', icon: <ShoppingBag size={22} color="#1d4ed8" />, onClick: () => setActiveTab('orders') },
            { label: 'Total Products', value: totalProducts, bg: '#faf5ff', iconBg: '#ede9fe', icon: <Package size={22} color="#7c3aed" />, onClick: () => setActiveTab('products') },
            { label: 'Processing Orders', value: processingCount, bg: '#fff7ed', iconBg: '#ffedd5', icon: <TrendingUp size={22} color="#c2410c" />, onClick: () => { setActiveTab('orders'); setFilterOption('PROCESSING'); } },
            { label: 'Low Stock Items', value: `${lowStockCount} items`, bg: '#fefce8', iconBg: '#fef9c3', icon: <AlertCircle size={22} color="#ca8a04" />, onClick: () => { setActiveTab('products'); setStockFilter('LOW_STOCK'); } },
            { label: 'Out of Stock', value: `${outOfStockCount} items`, bg: '#fef2f2', iconBg: '#fee2e2', icon: <AlertCircle size={22} color="#b91c1c" />, onClick: () => { setActiveTab('products'); setStockFilter('OUT_OF_STOCK'); } },
        ];

        return (
            <div>
                {/* Stat Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    {statCards.map((card, i) => (
                        <div
                            key={i}
                            onClick={card.onClick}
                            style={{
                                background: '#fff', padding: '22px', borderRadius: '12px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                                display: 'flex', alignItems: 'center', gap: '16px',
                                cursor: card.onClick ? 'pointer' : 'default',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                border: '1px solid #f1f5f9'
                            }}
                            onMouseOver={e => { if (card.onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; } }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'; }}
                        >
                            <div style={{ background: card.iconBg, padding: '14px', borderRadius: '12px', flexShrink: 0 }}>
                                {card.icon}
                            </div>
                            <div>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' }}>{card.label}</p>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a', fontWeight: '600' }}>{card.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Orders Table */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: '600' }}>Recent Orders</h3>
                        <button
                            onClick={() => setActiveTab('orders')}
                            style={{ background: 'transparent', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}
                        >
                            View all →
                        </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Order ID</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Customer</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Amount</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 && (
                                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No orders yet.</td></tr>
                                )}
                                {orders.slice(0, 8).map(o => {
                                    const colors = getStatusColor(o.status);
                                    return (
                                        <tr key={o._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: '500', fontSize: '0.9rem', color: '#0f172a' }}>{o.orderId}</td>
                                            <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.9rem' }}>{o.customerId?.name || 'Unknown'}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: '500', fontSize: '0.9rem' }}>₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ background: colors.bg, color: colors.text, padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                {new Date(o.orderDate || o.createdAt).toLocaleDateString('en-IN')}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderOrders = () => {
        const filteredData = orders.filter(o => {
            const matchesSearch = o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (o.customerId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterOption === 'ALL' || o.status === filterOption;
            return matchesSearch && matchesFilter;
        });

        return (
            <>
                {renderControls("Search by Order ID or Customer Name...", [
                    { value: 'PENDING', label: 'Pending' }, { value: 'PROCESSING', label: 'Processing' },
                    { value: 'SHIPPED', label: 'Shipped' }, { value: 'DELIVERED', label: 'Delivered' },
                    { value: 'CANCELLED', label: 'Cancelled' }
                ])}
                <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.9rem' }}>
                                <th style={{ padding: '16px' }}>Order ID</th>
                                <th style={{ padding: '16px' }}>Customer</th>
                                <th style={{ padding: '16px' }}>Amount</th>
                                <th style={{ padding: '16px' }}>Status</th>
                                <th style={{ padding: '16px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No orders found matching your search.</td></tr> : null}
                            {filteredData.map(order => {
                                const isUpdating = updatingId === order._id;
                                const colors = getStatusColor(order.status);
                                return (
                                    <tr key={order._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>{order.orderId}</td>
                                        <td style={{ padding: '16px' }}>{order.customerId?.name || 'Unknown'}<br /><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{order.customerId?.email}</span></td>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>₹{order.totalAmount}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ background: colors.bg, color: colors.text, padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>{order.status}</span>
                                            {order.tracking?.trackingNumber && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{order.tracking.courierName}: {order.tracking.trackingNumber}</div>}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {isUpdating ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={{ padding: '6px' }}>
                                                        <option value="PENDING">Pending</option>
                                                        <option value="PROCESSING">Processing</option>
                                                        <option value="SHIPPED">Shipped</option>
                                                        <option value="DELIVERED">Delivered</option>
                                                        <option value="CANCELLED">Cancelled</option>
                                                    </select>
                                                    {(editForm.status === 'SHIPPED' || editForm.status === 'DELIVERED') && (
                                                        <>
                                                            <input type="text" placeholder="Courier" value={editForm.courierName || ''} onChange={(e) => setEditForm({ ...editForm, courierName: e.target.value })} style={{ padding: '6px' }} />
                                                            <input type="text" placeholder="AWB Number" value={editForm.trackingNumber || ''} onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })} style={{ padding: '6px' }} />
                                                        </>
                                                    )}
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            disabled={isSaving}
                                                            onClick={() => submitOrderUpdate(order._id)}
                                                            style={{ background: isSaving ? '#94a3b8' : '#1b4332', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                                                            {isSaving ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button onClick={() => setUpdatingId(null)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => { setUpdatingId(order._id); setEditForm({ status: order.status, courierName: order.tracking?.courierName, trackingNumber: order.tracking?.trackingNumber }); }} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Manage</button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    // ✅ UPDATED: renderProducts — now with checkboxes + bulk actions (Shashank)
    const renderProducts = () => {
        let filteredData = products.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterOption === 'ALL' || p.status === filterOption;

            let matchesPrice = true;
            if (priceFilter === 'UNDER_500') matchesPrice = p.platformSellPrice < 500;
            if (priceFilter === 'OVER_1000') matchesPrice = p.platformSellPrice >= 1000;

            let matchesStock = true;
            const stock = p.inventory?.stock || 0;
            if (stockFilter === 'OUT_OF_STOCK') matchesStock = stock === 0;
            if (stockFilter === 'LOW_STOCK') matchesStock = stock > 0 && stock <= 10;
            if (stockFilter === 'IN_STOCK') matchesStock = stock > 10;

            return matchesSearch && matchesStatus && matchesPrice && matchesStock;
        });

        if (sortConfig.key) {
            filteredData.sort((a, b) => {
                let aValue = sortConfig.key === 'stock' ? (a.inventory?.stock || 0) : a[sortConfig.key];
                let bValue = sortConfig.key === 'stock' ? (b.inventory?.stock || 0) : b[sortConfig.key];
                if (typeof aValue === 'string') {
                    return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            });
        }

        return (
            <>
                {/* Filter Bar */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', background: '#fff', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <Search size={18} color="#94a3b8" />
                        <input type="text" placeholder="Search Title or SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', outline: 'none', marginLeft: '12px', width: '100%' }} />
                    </div>
                    <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }}>
                        <option value="ALL">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                    </select>
                    <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }}>
                        <option value="ALL">All Prices</option>
                        <option value="UNDER_500">Under ₹500</option>
                        <option value="OVER_1000">Over ₹1,000</option>
                    </select>
                    <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }}>
                        <option value="ALL">All Stock Levels</option>
                        <option value="IN_STOCK">In Stock ({'>'}10)</option>
                        <option value="LOW_STOCK">Low Stock (1–10)</option>
                        <option value="OUT_OF_STOCK">Out of Stock (0)</option>
                    </select>
                </div>

                {/* ✅ Bulk Action Bar — shows only when items are selected */}
                {selectedIds.length > 0 && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '600', color: '#1d4ed8', fontSize: '0.9rem' }}>{selectedIds.length} product(s) selected</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="number"
                                placeholder="Set stock qty"
                                value={bulkStock}
                                onChange={e => setBulkStock(e.target.value)}
                                min="0"
                                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '130px', fontSize: '0.9rem' }}
                            />
                            <button
                                onClick={handleBulkStockUpdate}
                                style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}
                            >
                                Update Stock
                            </button>
                        </div>
                        <button
                            onClick={handleMassDelete}
                            style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}
                        >
                            Delete Selected
                        </button>
                        <button
                            onClick={() => { setSelectedIds([]); setBulkStock(''); }}
                            style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            Clear Selection
                        </button>
                    </div>
                )}

                {/* Products Table */}
                <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.9rem' }}>
                                {/* ✅ Checkbox column */}
                                <th style={{ padding: '16px', width: '48px' }}>
                                    <input
                                        type="checkbox"
                                        onChange={() => handleSelectAll(filteredData)}
                                        checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                    />
                                </th>
                                <th onClick={() => handleSort('title')} style={{ padding: '16px', cursor: 'pointer', userSelect: 'none' }}>Product {getSortIcon('title')}</th>
                                <th onClick={() => handleSort('platformSellPrice')} style={{ padding: '16px', cursor: 'pointer', userSelect: 'none' }}>Price (₹) {getSortIcon('platformSellPrice')}</th>
                                <th onClick={() => handleSort('stock')} style={{ padding: '16px', cursor: 'pointer', userSelect: 'none' }}>Stock {getSortIcon('stock')}</th>
                                <th style={{ padding: '16px' }}>Status</th>
                                <th style={{ padding: '16px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No products found.</td></tr> : null}
                            {filteredData.map(p => {
                                const isEdit = updatingId === p._id;
                                const isSelected = selectedIds.includes(p._id);
                                return (
                                    <tr key={p._id} style={{ borderBottom: '1px solid #e2e8f0', background: isSelected ? '#f0f9ff' : 'transparent' }}>
                                        {/* ✅ Per-row checkbox */}
                                        <td style={{ padding: '16px' }}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => {
                                                    setSelectedIds(prev =>
                                                        prev.includes(p._id)
                                                            ? prev.filter(id => id !== p._id)
                                                            : [...prev, p._id]
                                                    );
                                                }}
                                                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: '500', color: '#0f172a' }}>{p.title.substring(0, 40)}...</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>SKU: {p.sku}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {isEdit ? <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} style={{ width: '80px', padding: '4px' }} /> : `₹${p.platformSellPrice}`}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {isEdit ? <input type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} style={{ width: '60px', padding: '4px' }} /> : (
                                                <span style={{ color: p.inventory?.stock === 0 ? '#dc2626' : p.inventory?.stock <= 10 ? '#ca8a04' : 'inherit', fontWeight: p.inventory?.stock <= 10 ? '600' : 'normal' }}>
                                                    {p.inventory?.stock ?? 0}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {isEdit ? (
                                                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} style={{ padding: '4px' }}>
                                                    <option value="active">Active</option>
                                                    <option value="draft">Draft</option>
                                                </select>
                                            ) : (
                                                <span style={{ background: p.status === 'active' ? '#dcfce7' : '#f1f5f9', color: p.status === 'active' ? '#166534' : '#475569', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                                    {p.status}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {isEdit ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        disabled={isSaving}
                                                        onClick={() => submitProductUpdate(p._id)}
                                                        style={{ background: isSaving ? '#94a3b8' : '#1b4332', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                                                        {isSaving ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button onClick={() => setUpdatingId(null)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => { setUpdatingId(p._id); setEditForm({ price: p.platformSellPrice, stock: p.inventory?.stock, status: p.status }); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#1d4ed8' }}>
                                                    <Edit2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    const renderUsers = () => {
        const filteredData = users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterOption === 'ALL' || u.role === filterOption;
            return matchesSearch && matchesFilter;
        });

        return (
            <>
                {renderControls("Search by Name or Email...", [
                    { value: 'CUSTOMER', label: 'Customer' }, { value: 'ADMIN', label: 'Admin' }
                ])}
                <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.9rem' }}>
                                <th style={{ padding: '16px' }}>Name</th>
                                <th style={{ padding: '16px' }}>Email</th>
                                <th style={{ padding: '16px' }}>Role</th>
                                <th style={{ padding: '16px' }}>Joined Date</th>
                                <th style={{ padding: '16px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No users found.</td></tr> : null}
                            {filteredData.map(u => {
                                const isEdit = updatingId === u._id;
                                return (
                                    <tr key={u._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>{u.name}</td>
                                        <td style={{ padding: '16px', color: '#64748b' }}>{u.email}</td>
                                        <td style={{ padding: '16px' }}>
                                            {isEdit ? (
                                                <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} style={{ padding: '4px' }}>
                                                    <option value="CUSTOMER">Customer</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            ) : (
                                                <span style={{ background: u.role === 'ADMIN' ? '#fee2e2' : '#e0f2fe', color: u.role === 'ADMIN' ? '#991b1b' : '#075985', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>{u.role}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px', color: '#64748b' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '16px' }}>
                                            {isEdit ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        disabled={isSaving}
                                                        onClick={() => submitUserUpdate(u._id)}
                                                        style={{ background: isSaving ? '#94a3b8' : '#1b4332', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                                                        {isSaving ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button onClick={() => setUpdatingId(null)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => { setUpdatingId(u._id); setEditForm({ role: u.role }); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#1d4ed8' }}><Edit2 size={18} /></button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    // --- MAIN LAYOUT ---
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
            <Navbar />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* SIDEBAR */}
                <aside style={{ width: '260px', background: '#fff', borderRight: '1px solid #e2e8f0', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', marginBottom: '8px', marginLeft: '12px' }}>Admin Control</h3>

                    {[
                        { id: 'overview', icon: TrendingUp, label: 'Overview' },
                        { id: 'orders', icon: ShoppingBag, label: 'Orders & Fulfillment' },
                        { id: 'products', icon: Package, label: 'Catalog / Products' },
                        { id: 'bulk-upload', icon: Upload, label: 'Bulk Product Upload' },
                        { id: 'users', icon: Users, label: 'Customers & Roles' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleSidebarClick(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px', borderRadius: '8px',
                                border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', transition: 'all 0.2s ease',
                                background: activeTab === tab.id ? '#f0fdf4' : 'transparent',
                                color: activeTab === tab.id ? '#1b4332' : '#64748b',
                                textAlign: 'left'
                            }}
                        >
                            <tab.icon size={20} color={activeTab === tab.id ? '#1b4332' : '#94a3b8'} />
                            {tab.label}
                        </button>
                    ))}
                </aside>

                {/* CONTENT AREA */}
                <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: 0, textTransform: 'capitalize' }}>
                            {activeTab.replace('-', ' ')}
                        </h2>
                        {/* ✅ Show selected count badge in header when on products tab */}
                        {activeTab === 'products' && selectedIds.length > 0 && (
                            <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                                {selectedIds.length} selected
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8', fontSize: '1rem' }}>
                            Loading data...
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'orders' && renderOrders()}
                            {activeTab === 'products' && renderProducts()}
                            {activeTab === 'bulk-upload' && <BulkUpload />}
                            {activeTab === 'users' && renderUsers()}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;