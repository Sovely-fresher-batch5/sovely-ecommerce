import React, { useContext } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { CartContext } from '../CartContext';
import { Trash2, Minus, Plus, MapPin, CreditCard, ChevronRight, ShoppingCart, Share2 } from 'lucide-react';
import './Dashboard.css';

function FullCartPage() {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useContext(CartContext);
    const subtotal = getCartTotal();
    const shipping = subtotal > 0 ? 40.00 : 0;
    const codCharge = 25;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + codCharge + tax;

    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-viewport">
                <Navbar />
                <main className="content-area dashboard-page">
                    <div className="section-container">
                        <h1 className="dashboard-title">Your Cart ({cartItems.length} items)</h1>
                        
                        <div className="cart-grid">
                            <div className="cart-main-col">
                                {cartItems.length > 0 ? (
                                    <div className="cart-items-list dashboard-card">
                                        {cartItems.map((item, i) => (
                                            <div key={i} className="cart-item-row">
                                                <div className="cart-item-img">
                                                    <img src={item.product.image} alt={item.product.title} />
                                                </div>
                                                <div className="cart-item-details">
                                                    <h4 className="item-title">{item.product.title}</h4>
                                                    <p className="item-sku">sku: {item.product.sku}</p>
                                                    <div className="item-actions">
                                                        <div className="qty-control">
                                                            <button onClick={() => updateQuantity(item.product.id, -1)}><Minus size={14} /></button>
                                                            <span>{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.product.id, 1)}><Plus size={14} /></button>
                                                        </div>
                                                        <button className="remove-btn" onClick={() => removeFromCart(item.product.id)}>
                                                            <Trash2 size={16} /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="cart-item-price">
                                                    ₹{item.product.price.toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="dashboard-card empty-cart-msg">
                                        <ShoppingCart size={48} />
                                        <h3>Your cart is empty</h3>
                                        <p>Browse our products and add them to your cart.</p>
                                    </div>
                                )}
                            </div>

                            <div className="cart-sidebar-col">
                                <div className="cart-card dashboard-card">
                                    <h3 className="card-title">Shipping Address</h3>
                                    <button className="add-address-btn">
                                        <Plus size={16} /> Add New Address
                                    </button>
                                </div>

                                <div className="cart-card dashboard-card">
                                    <h3 className="card-title">Payment Method</h3>
                                    <div className="payment-options">
                                        <label className="payment-opt">
                                            <input type="radio" name="payment" defaultChecked />
                                            <span>Prepaid</span>
                                        </label>
                                        <label className="payment-opt">
                                            <input type="radio" name="payment" />
                                            <span>Cash On Delivery</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="cart-card dashboard-card summary-card">
                                    <h3 className="card-title">Order Summary</h3>
                                    <div className="summary-lines">
                                        <div className="summary-line">
                                            <span>Sub Total (Item Cost) :</span>
                                            <span>₹{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="summary-line">
                                            <span>Shipping Charge (351 gm) :</span>
                                            <span>₹{shipping.toFixed(2)}</span>
                                        </div>
                                        <div className="summary-line">
                                            <span>COD Charge :</span>
                                            <span>₹{codCharge.toFixed(2)}</span>
                                        </div>
                                        <div className="summary-line">
                                            <span>Tax :</span>
                                            <span>₹{tax.toFixed(2)}</span>
                                        </div>
                                        <div className="summary-line">
                                            <span>Shipping Tax :</span>
                                            <span>₹{(tax * 0.1).toFixed(2)}</span>
                                        </div>
                                        <div className="summary-line total-highlight">
                                            <span className="fw-bold">Total (INR) :</span>
                                            <span className="fw-bold">₹{total.toFixed(2)}</span>
                                        </div>
                                        <div className="summary-line">
                                            <span>Selling Price Total (INR) :</span>
                                            <input type="number" className="selling-price-input" placeholder="0.00" />
                                        </div>
                                        <div className="summary-line profit-highlight">
                                            <span>Profit :</span>
                                            <span>₹ 0.00</span>
                                        </div>
                                    </div>
                                    <button className="place-order-btn">
                                        Place Order <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Floating Referral widget */}
                    <div className="referral-fab">
                        <Share2 size={16} /> Refer a friend
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}

export default FullCartPage;
