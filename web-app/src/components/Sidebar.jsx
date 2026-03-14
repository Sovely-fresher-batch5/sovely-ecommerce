import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { 
  Home, 
  BarChart3, 
  Package, 
  AlertCircle, 
  Wallet, 
  ShoppingCart, 
  Layers, 
  User, 
  Settings,
  Bell,
  LogOut,
  Truck
} from 'lucide-react';

function Sidebar() {
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);

    const navItems = [
        { icon: BarChart3, label: 'Analytics', path: '/analytics', active: location.pathname === '/analytics' },
        { icon: Home, label: 'Overview', path: '/', active: location.pathname === '/' },
        { icon: Truck, label: 'Courier Service', path: '/courier-service', active: location.pathname === '/courier-service' },
        { icon: Package, label: 'Manage Orders', path: '/manage-orders', active: location.pathname === '/manage-orders' },
        { icon: AlertCircle, label: 'Manage NDR', path: '/manage-ndr', active: location.pathname === '/manage-ndr' },
        { icon: Wallet, label: 'Wallet', path: '/wallet', active: location.pathname === '/wallet' },
        { icon: ShoppingCart, label: 'Cart', path: '/cart', active: location.pathname === '/cart' },
        { icon: Layers, label: 'Bulk Order', path: '/bulk-order', active: location.pathname === '/bulk-order' },
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
