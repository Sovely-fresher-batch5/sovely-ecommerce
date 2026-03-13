import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { 
  Home, 
  Search, 
  LayoutGrid, 
  ShoppingBag, 
  Wallet, 
  User, 
  Settings,
  Bell,
  LogOut
} from 'lucide-react';

function Sidebar() {
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);

    const navItems = [
        { icon: Home, label: 'Home', path: '/', active: location.pathname === '/' },
        { icon: Search, label: 'Search', path: '#search' },
        { icon: LayoutGrid, label: 'Categories', path: '#categories' },
        { icon: ShoppingBag, label: 'Orders', path: '/orders' },
        { icon: Wallet, label: 'Wallet', path: '#wallet' },
        { icon: Bell, label: 'Notifications', path: '#notifications' },
        { icon: User, label: 'Profile', path: '/my-account' },
        { icon: Settings, label: 'Settings', path: '#settings' },
    ];

    return (
        <aside className="vertical-sidebar">
            <div className="sidebar-logo-mini">
                <img src="https://m.media-amazon.com/images/X/bxt1/M/Bbxt1BI1cNpD5ln._SL160_QL95_FMwebp_.png" alt="Sovely" className="mini-logo-img" />
            </div>

            <nav className="sidebar-nav-items">
                {navItems.map((item, index) => (
                    <Link 
                        key={index} 
                        to={item.path} 
                        className={`side-nav-item ${item.active ? 'active' : ''}`}
                        title={item.label}
                    >
                        <item.icon size={22} strokeWidth={2} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-bottom-actions">
                <button className="side-action-btn" title="Logout" onClick={logout}>
                    <LogOut size={22} />
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
