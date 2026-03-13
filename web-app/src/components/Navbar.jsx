import { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { CartContext } from '../CartContext';
import { WishlistContext } from '../WishlistContext';
import { ShoppingCart, Heart, Bell, User, Search, Headphones, Wallet, ChevronDown } from 'lucide-react';
import WishlistDrawer from './WishlistDrawer';

function Navbar({ onSelectCategory, searchQuery, onSearchChange, onSearchSubmit }) {
  const { user, balance, logout, loading } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearchSubmit && onSearchSubmit(searchQuery);
    }
  };

  return (
    <nav className="navbar-b2b">
      <div className="navbar-container">
        {/* Left: Logo */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo-b2b">
            <img src="https://m.media-amazon.com/images/X/bxt1/M/Bbxt1BI1cNpD5ln._SL160_QL95_FMwebp_.png" alt="Sovely Logo" className="logo-image-b2b" />
            <div className="logo-text-stack">
              <span className="logo-brand">SOVELY</span>
              <span className="logo-sub">PREMIUM MARKETPLACE</span>
            </div>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="navbar-center" style={{ flexGrow: 1, maxWidth: '800px', margin: '0 40px' }}>
            <div className="b2b-search-bar" style={{ 
                width: '100%', 
                height: '48px', 
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0 8px 0 16px',
                boxShadow: 'none',
                gap: '12px'
            }}>
                <Search size={18} color="#94a3b8" />
                <input 
                    type="text" 
                    placeholder="Search Orders, Products or SKU (e.g. DE124, Magic Book)" 
                    value={searchQuery}
                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ fontSize: '14px', fontWeight: 500, backgroundColor: 'transparent' }}
                />
                <button 
                  className="premium-search-btn" 
                  onClick={() => onSearchSubmit && onSearchSubmit(searchQuery)}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    padding: '0 20px',
                    height: '36px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                    Search
                </button>
            </div>
        </div>

        {/* Right: Actions */}
        <div className="navbar-right-b2b">
          <div className="b2b-nav-buttons" style={{ gap: '15px' }}>
            {/* Combined Support Hub */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.8px' }}>CONTACT SUPPORT</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-text)', fontWeight: 700, fontSize: '14px' }}>
                    <Headphones size={14} />
                    +91 96626-86196
                </div>
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 5px' }}></div>

            <Link to="/wallet" className="nav-btn wallet-balance-nav" style={{
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                backgroundColor: 'rgba(27, 67, 50, 0.05)', 
                color: '#1b4332', 
                border: '1.5px solid rgba(27, 67, 50, 0.2)',
                transition: 'all 0.2s ease',
                fontWeight: 700,
                padding: '0 15px',
                height: '42px',
                borderRadius: '10px'
            }}>
                <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: '#1b4332',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Wallet size={16} color="white" />
                </div>
                <span style={{ fontSize: '15px' }}>₹{balance.toFixed(2)}</span>
            </Link>
            
            <Link to="/wallet?action=recharge" className="nav-btn recharge-btn" style={{
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                height: '42px',
                padding: '0 18px',
                borderRadius: '10px',
                backgroundColor: '#1b4332',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px'
            }}>
                Recharge
            </Link>
          </div>

          <div className="b2b-icon-actions">
            <button className="icon-action-btn" aria-label="Wishlist" onClick={() => setIsWishlistOpen(true)}>
                <Heart size={22} fill={wishlistItems?.length > 0 ? "var(--color-primary)" : "none"} stroke={wishlistItems?.length > 0 ? "var(--color-primary)" : "currentColor"} />
                {wishlistItems?.length > 0 && <span className="action-badge">{wishlistItems.length}</span>}
            </button>
            <button className="icon-action-btn" aria-label="Notifications">
                <Bell size={22} />
            </button>
            <Link to="/cart" className="icon-action-btn" aria-label="Cart">
                <ShoppingCart size={22} />
                {cartItems?.length > 0 && <span className="action-badge">{cartItems.length}</span>}
            </Link>
            <div className="user-profile-toggle">
                <User size={22} />
                {user && <span className="user-name-small">{user.name.split(' ')[0]}</span>}
            </div>
          </div>
        </div>
      </div>
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </nav>
  );
}

export default Navbar;
