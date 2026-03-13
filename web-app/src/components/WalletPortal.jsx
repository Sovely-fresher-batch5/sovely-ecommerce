import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { Wallet, Search, List, ArrowUpRight } from 'lucide-react';
import './Dashboard.css';

function WalletPortal() {
    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-viewport">
                <Navbar />
                <main className="content-area dashboard-page">
                    <div className="section-container">
                        <header className="dashboard-header">
                            <div className="title-with-icon">
                                <h1 className="dashboard-title">Wallet</h1>
                                <span className="info-icon">ⓘ</span>
                            </div>
                            <div className="header-actions">
                                <button className="dash-danger-btn">Withdraw Request</button>
                                <button className="dash-secondary-btn">Remittance List</button>
                            </div>
                        </header>

                        <div className="filter-bar dashboard-card">
                            <div className="filter-inputs">
                                <input type="text" placeholder="Order Id" className="dashboard-input" style={{width: '200px'}} />
                                <button className="dash-search-btn">
                                    <Search size={16} /> Search
                                </button>
                            </div>
                        </div>

                        <div className="table-container dashboard-card">
                            <table className="dash-table wallet-table">
                                <thead>
                                    <tr>
                                        <th>Opening Balance</th>
                                        <th>Debit</th>
                                        <th>Credit</th>
                                        <th>Balance</th>
                                        <th>Narration</th>
                                        <th>Comment</th>
                                        <th>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Sample row from screenshot */}
                                    <tr>
                                        <td>571.16</td>
                                        <td className="text-danger">13.19</td>
                                        <td>0.00</td>
                                        <td className="fw-bold">557.97</td>
                                        <td>Tax Value</td>
                                        <td>For Order Id Tax 454460</td>
                                        <td>3/12/26, 11:41 AM</td>
                                    </tr>
                                    <tr>
                                        <td>583.76</td>
                                        <td className="text-danger">12.60</td>
                                        <td>0.00</td>
                                        <td className="fw-bold">571.16</td>
                                        <td>Shipping Tax Value</td>
                                        <td>For Order Id Shipping Tax 454460</td>
                                        <td>3/12/26, 11:41 AM</td>
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

export default WalletPortal;
