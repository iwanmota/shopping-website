import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { checkout } from '../services/checkout';
import useModalFocus from '../hooks/useModalFocus';
import './CartModal.css';

const BagIcon = ({ type }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {type === 'close' ? (
      <path d="m6 6 12 12M6 18 18 6" />
    ) : type === 'minus' ? (
      <path d="M5 12h14" />
    ) : (
      <path d="M5 12h14M12 5v14" />
    )}
  </svg>
);

const CartModal = ({ isOpen, onClose, onCheckoutSuccess }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } =
    useCart();
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();
  const [checkoutError, setCheckoutError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const panel = useModalFocus(isOpen, onClose);
  if (!isOpen) return null;

  const count = cartItems.reduce((total, item) => total + item.quantity, 0);
  const money = (value) =>
    value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setCheckoutError('Please log in before checking out.');
      return;
    }
    setCheckoutError('');
    setCheckingOut(true);
    try {
      const receipt = await checkout(cartItems, token);
      clearCart();
      onCheckoutSuccess(receipt);
    } catch (error) {
      setCheckoutError(error.message);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div
      className="modal-overlay bag-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content bag-panel"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        tabIndex={-1}
      >
        <header className="bag-header">
          <div>
            <p className="bag-eyebrow">Thoughtfully selected</p>
            <h2 id="bag-title">Your shopping bag</h2>
          </div>
          <button
            className="bag-close"
            aria-label="Close shopping bag"
            onClick={onClose}
          >
            <BagIcon type="close" />
          </button>
        </header>
        <div className="bag-toolbar">
          <span aria-live="polite">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
          {cartItems.length > 0 && (
            <button
              className="bag-text-button"
              onClick={() => {
                clearCart();
                setCheckoutError('');
              }}
              disabled={checkingOut}
            >
              Clear bag
            </button>
          )}
        </div>
        <div className="bag-items">
          {cartItems.length === 0 ? (
            <div className="bag-empty">
              <svg
                width="44"
                height="44"
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                aria-hidden="true"
              >
                <path d="M7 10h18l2 18H5l2-18Z" />
                <path d="M11 12V8a5 5 0 0 1 10 0v4" />
              </svg>
              <h3>A little room for something good.</h3>
              <p>Your bag is empty. Find your next everyday favourite.</p>
              <button className="bag-continue" onClick={onClose}>
                Continue shopping <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <ul>
              {cartItems.map((item) => (
                <li key={item.lineId} className="bag-item">
                  <img className="bag-image" src={item.image} alt={item.name} />
                  <div className="bag-item-details">
                    <h3>{item.name}</h3>
                    <p className="bag-unit-price">
                      {money(item.price)} each{' '}
                      {item.isOnSale && (
                        <span className="bag-sale-label">Sale</span>
                      )}
                    </p>
                    <div className="bag-item-controls">
                      <div
                        className="bag-stepper"
                        role="group"
                        aria-label={`${item.name}${item.isOnSale ? ', sale price' : ', regular price'} quantity`}
                      >
                        <button
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() =>
                            updateQuantity(item.lineId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || checkingOut}
                        >
                          <BagIcon type="minus" />
                        </button>
                        <span
                          className="bag-quantity"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          {item.quantity}
                        </span>
                        <button
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() =>
                            updateQuantity(item.lineId, item.quantity + 1)
                          }
                          disabled={checkingOut}
                        >
                          <BagIcon type="plus" />
                        </button>
                      </div>
                      <button
                        className="bag-remove"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeFromCart(item.lineId)}
                        disabled={checkingOut}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="bag-line-total">
                    {money(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {cartItems.length > 0 && (
          <footer className="bag-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>{money(cartTotal)}</span>
            </div>
            <p className="bag-currency-note">All prices in Canadian dollars.</p>
            {checkoutError && (
              <div className="bag-error" role="alert">
                <p>{checkoutError}</p>
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    state={{ from: location.pathname + location.search }}
                    onClick={onClose}
                  >
                    Log in to continue →
                  </Link>
                )}
              </div>
            )}
            <button
              className="bag-checkout"
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Processing…' : 'Proceed to Checkout'}
              <span aria-hidden="true">→</span>
            </button>
            <button className="bag-continue" onClick={onClose}>
              Continue shopping
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};
export default CartModal;
