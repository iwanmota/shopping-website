import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = ({ onCartClick }) => {
    const { cartItems } = useCart();
    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const location = useLocation();

    return (
        <header className="main-header">
            <div className="header-content">
                <div className="logo">
                    <h1>ShopSmart</h1>
                </div>
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