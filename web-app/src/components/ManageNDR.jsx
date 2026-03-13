import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { AlertCircle, Search, Download, Upload } from 'lucide-react';
import './Dashboard.css';

function ManageNDR() {
    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-viewport">
                <Navbar />
                <main className="content-area dashboard-page">
                    <div className="section-container">
                        <header className="dashboard-header">
                            <h1 className="dashboard-title">Manage NDR</h1>
                            <div className="header-actions">
                                <button className="dash-secondary-btn"><Download size={16} /> Export NDR</button>
                                <button className="dash-secondary-btn"><Upload size={16} /> Import NDR</button>
                            </div>
                        </header>

                        <div className="dashboard-tabs-container">
                            <div className="dashboard-tabs">
                                <button className="tab-item active">NDR</button>
                                <button className="tab-item">NDR Provided</button>
                            </div>
                        </div>

                        <div className="filter-bar dashboard-card">
                            <div className="filter-inputs">
                                <input type="text" placeholder="Order Id, Customer, AWB Number" className="dashboard-input" />
                                <div className="date-picker-dash">Select Date Range</div>
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
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="9" style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
                                            No NDR orders found in this period.
                                        </td>
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

export default ManageNDR;
