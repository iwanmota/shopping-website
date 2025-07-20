/**
 * Header Component
 * 
 * Displays the application header with navigation links and cart button.
 * Shows the current cart item count and highlights the active navigation link.
 * 
 * @component
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
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
    
    // Calculate total number of items in cart
    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    // Get current location for highlighting active nav link
    const location = useLocation();

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
                
                {/* Cart button with item count badge */}
                <div className="header-actions">
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