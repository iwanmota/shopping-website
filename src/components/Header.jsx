import React from 'react';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = ({ onCartClick }) => {
    const { cartItems } = useCart();
    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className="main-header">
            <div className="header-content">
                <div className="logo">
                    <h1>ShopSmart</h1>
                </div>
                <nav className="main-nav">
                    <ul>
                        <li><a href="/" className="active">Home</a></li>
                        <li><a href="/products">Products</a></li>
                        <li><a href="/deals">Deals</a></li>
                        <li><a href="/about">About</a></li>
                    </ul>
                </nav>
                <div className="header-actions">
                    <button className="search-btn">
                        <i className="fas fa-search"></i>
                    </button>
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