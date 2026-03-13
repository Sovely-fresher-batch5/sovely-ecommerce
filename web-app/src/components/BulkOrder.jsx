import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { Layers, Upload, Download } from 'lucide-react';
import './Dashboard.css';

function BulkOrder() {
    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-viewport">
                <Navbar />
                <main className="content-area dashboard-page">
                    <div className="section-container">
                        <header className="dashboard-header">
                            <h1 className="dashboard-title">Bulk Order</h1>
                            <div className="action-buttons-group">
                                <button className="dash-secondary-btn"><Download size={16} /> Sample File</button>
                                <button className="premium-btn"><Upload size={16} /> Upload CSV</button>
                            </div>
                        </header>

                        <div className="dashboard-card bulk-info-card">
                            <div className="bulk-icon-area">
                                <Layers size={48} color="var(--color-primary)" />
                            </div>
                            <div className="bulk-text-area">
                                <h3>Bulk Import Your Orders</h3>
                                <p>Download the sample CSV file, fill it with your order data, and upload it back to process hundreds of orders at once.</p>
                                <ul className="bulk-features">
                                    <li>✓ Support for up to 1000 orders per file</li>
                                    <li>✓ Automatic address validation</li>
                                    <li>✓ Instant SKU mapping</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}

export default BulkOrder;
