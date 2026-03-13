import { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { CartContext } from '../CartContext';
import { WishlistContext } from '../WishlistContext';
import { ShoppingCart, Heart, Bell, User, Search, Headphones, Wallet, ChevronDown } from 'lucide-react';
import WishlistDrawer from './WishlistDrawer';

function Navbar({ onSelectCategory, searchQuery, onSearchChange, onSearchSubmit }) {
  const { user, logout, loading } = useContext(AuthContext);
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
        <div className="navbar-center">
            <div className="b2b-search-bar">
                <input 
                    type="text" 
                    placeholder="Search Orders & Products (e.g. DE124, Magic Book)" 
                    value={searchQuery}
                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button className="search-submit-btn" onClick={() => onSearchSubmit && onSearchSubmit(searchQuery)}>
                    <Search size={20} />
                </button>
            </div>
        </div>

        {/* Right: Actions */}
        <div className="navbar-right-b2b">
          <div className="contact-info">
             <span className="phone-number">+91 96626-86196</span>
          </div>
          
          <div className="b2b-nav-buttons">
            <button className="nav-btn support-btn">
                <Headphones size={16} />
                Support
            </button>
            <button className="nav-btn recharge-btn">
                Recharge Wallet
            </button>
          </div>

          <div className="store-selector">
            <span className="store-label">Select Store</span>
            <div className="store-name">
                Enfinty Enterprises
                <ChevronDown size={14} />
            </div>
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
