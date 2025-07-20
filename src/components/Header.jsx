/**
 * Header Component
 * 
 * Displays the application header with navigation links and cart button.
 * Shows the current cart item count and highlights the active navigation link.
 * Includes authentication links based on user login status.
 * 
 * @component
 */
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

/**
 * Header component for site navigation and cart access
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onCartClick - Handler function for cart button click
 * @returns {React.ReactElement} Header component with navigation and cart button
 */
const Header = ({ onCartClick }) => {
    // Get cart data from context
    const { cartItems } = useCart();
    
    // Get authentication context
    const { isAuthenticated, user, logout } = useAuth();
    
    // Calculate total number of items in cart
    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    // Get current location for highlighting active nav link
    const location = useLocation();
    
    // Get navigate function for redirecting after logout
    const navigate = useNavigate();
    
    // Handle logout button click
    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="main-header">
            <div className="header-content">
                {/* Site logo */}
                <div className="logo">
                    <h1>ShopSmart</h1>
                </div>
                
                {/* Main navigation */}
                <nav className="main-nav">
                    <ul>
                        <li>
                            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>
                                Products
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                                About
                            </Link>
                        </li>
                    </ul>
                </nav>
                
                {/* Cart button with item count badge and auth links */}
                <div className="header-actions">
                    {isAuthenticated ? (
                        <>
                            {user && user.role === 'admin' && (
                                <Link to="/admin" className={location.pathname === '/admin' ? 'auth-link active' : 'auth-link'}>
                                    Admin
                                </Link>
                            )}
                            <Link to="/profile" className={location.pathname === '/profile' ? 'auth-link active' : 'auth-link'}>
                                Profile
                            </Link>
                            <button className="auth-link logout-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className={location.pathname === '/login' ? 'auth-link active' : 'auth-link'}>
                            Login
                        </Link>
                    )}
                    <button className="cart-btn" onClick={onCartClick}>
                        <i className="fas fa-shopping-cart"></i>
                        {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;