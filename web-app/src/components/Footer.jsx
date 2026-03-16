import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="footer" id="footer">
            <div className="section-container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <span className="logo-text">SOVELY</span>
                        </Link>
                        <p className="footer-tagline">
                           Leading B2B Marketplace for premium products. Empowering stores with wholesale inventory and express delivery across the globe.
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-link" aria-label="Facebook">📘</a>
                            <a href="#" className="social-link" aria-label="Twitter">🐦</a>
                            <a href="#" className="social-link" aria-label="Instagram">📷</a>
                            <a href="#" className="social-link" aria-label="LinkedIn">💼</a>
                        </div>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="footer-heading">Shop</h4>
                        <ul className="footer-links">
                            <li><a href="#">Home & Kitchen</a></li>
                            <li><a href="#">Home Improvement</a></li>
                            <li><a href="#">Health & Personal Care</a></li>
                            <li><a href="#">Industrial & Scientific</a></li>
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="footer-heading">About Us</h4>
                        <ul className="footer-links">
                            <li><a href="#">About Sovely</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">News & Blog</a></li>
                            <li><a href="#">Help</a></li>
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="footer-heading">Services</h4>
                        <ul className="footer-links">
                            <li><a href="#">Gift Card</a></li>
                            <li><a href="#">Mobile App</a></li>
                            <li><a href="#">Shipping & Delivery</a></li>
                            <li><a href="#">Order Pickup</a></li>
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="footer-heading">Help</h4>
                        <ul className="footer-links">
                            <li><a href="#">Sovely Help</a></li>
                            <li><a href="#">Returns</a></li>
                            <li><a href="#">Track Orders</a></li>
                            <li><a href="#">Contact Us</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-cta-row">
                    <a href="#" className="footer-cta-card">
                        <span className="cta-icon">🏪</span>
                        <span>Become Seller</span>
                    </a>
                    <a href="#" className="footer-cta-card">
                        <span className="cta-icon">🎁</span>
                        <span>Gift Cards</span>
                    </a>
                    <a href="#" className="footer-cta-card">
                        <span className="cta-icon">❓</span>
                        <span>Help Center</span>
                    </a>
                </div>

                <div className="footer-bottom">
                    <p className="footer-copyright">© 2024 Sovely Premium Marketplace. All rights reserved.</p>

                    <div className="footer-payments">
                        <span className="payment-text">We accept</span>
                        <div className="payment-icons">
                             {/* Simplified payment icons for mock */}
                             <span className="payment-mock">VISA</span>
                             <span className="payment-mock">MC</span>
                             <span className="payment-mock">UPI</span>
                        </div>
                    </div>

                    <div className="footer-legal">
                        <a href="#">Terms of Service</a>
                        <a href="#">Privacy & Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
