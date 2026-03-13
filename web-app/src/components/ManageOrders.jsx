import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { Package, Search, Download, ExternalLink, Filter } from 'lucide-react';
import './Dashboard.css';

function ManageOrders() {
    const tabs = ['Draft', 'Confirmed', 'Shipped', 'Closed', 'Delivered', 'Cancelled', 'RTO', 'All Orders', 'Profit', 'Upcoming Estimate Profit'];

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
                                <Download size={16} /> Export Shipped
                            </button>
                        </header>

                        <div className="dashboard-tabs-container">
                            <div className="dashboard-tabs">
                                {tabs.map((tab, i) => (
                                    <button key={i} className={`tab-item ${tab === 'Shipped' ? 'active' : ''}`}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-bar dashboard-card">
                            <div className="filter-inputs">
                                <input type="text" placeholder="Order Id, Customer, AWB Number" className="dashboard-input" />
                                <div className="date-picker-dash">Select Date Range</div>
                                <select className="dashboard-select">
                                    <option>All</option>
                                </select>
                                <button className="dash-search-btn">
                                    <Search size={16} /> Search
                                </button>
                            </div>
                        </div>

                        <div className="table-container dashboard-card">
                            <table className="dash-table">
                                <thead>
                                    <tr>
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
                                    <tr className="empty-row">
                                        <td colSpan="8">Connect an API or add sample data to see orders here.</td>
                                    </tr>
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

export default ManageOrders;
