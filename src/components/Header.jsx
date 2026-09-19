import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Brand from './Brand';
import './Header.css';

const Header = ({ onCartClick }) => {
  const { cartItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const count = cartItems.reduce((total, item) => total + item.quantity, 0);
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="announcement">
        <span>Proudly Canadian. Thoughtfully selected.</span>
        <span>Everyday essentials, exceptional finds.</span>
      </div>
      <header className="main-header">
        <div className="header-content">
          <Brand />
          <nav className="main-nav" aria-label="Main navigation">
            <NavLink to="/products">Shop all</NavLink>
            <Link to="/products?filter=Sale">Special offers</Link>
            <NavLink to="/about">Our story</NavLink>
          </nav>
          <div className="header-actions">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link className="auth-link" to="/admin">
                    Admin
                  </Link>
                )}
                <Link className="auth-link" to="/profile">
                  Profile
                </Link>
                <button className="auth-link logout-btn" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <Link className="auth-link" to="/login">
                Log in
              </Link>
            )}
            <button
              className="cart-btn"
              onClick={onCartClick}
              aria-label={`Open shopping bag, ${count} items`}
            >
              Bag{' '}
              <span className="cart-count" aria-live="polite">
                {count}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
export default Header;
