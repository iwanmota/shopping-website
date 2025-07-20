/**
 * Shopping Cart Modal Component
 * 
 * Displays the current cart contents in a modal overlay.
 * Allows users to view items, adjust quantities, remove items, and proceed to checkout.
 * 
 * @component
 */
import React from 'react';
import { useCart } from '../context/CartContext';
import './CartModal.css';

/**
 * CartModal component for displaying and managing cart contents
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is currently visible
 * @param {Function} props.onClose - Handler function to close the modal
 * @returns {React.ReactElement|null} Cart modal component or null when closed
 */
const CartModal = ({ isOpen, onClose }) => {
    // Get cart state and functions from context
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

    // Don't render anything if modal is closed
    if (!isOpen) return null;

    /**
     * Format price to display with 2 decimal places
     * 
     * @param {number} price - Price to format
     * @returns {string} Formatted price with 2 decimal places
     */
    const formatPrice = (price) => price.toFixed(2);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Shopping Cart</h2>
                    <div className="header-actions">
                        {cartItems.length > 0 && (
                            <button className="clear-cart-button" onClick={clearCart}>
                                Clear Cart
                            </button>
                        )}
                        <button className="close-button" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div className="cart-items">
                    {cartItems.length === 0 ? (
                        <p className="empty-cart">Your cart is empty</p>
                    ) : (
                        <ul>
                            {cartItems.map(item => (
                                <li key={`${item.id}-${item.isOnSale ? 'sale' : 'regular'}`} className="cart-item">
                                    <div className="item-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="item-info">
                                        <h3>{item.name}</h3>
                                        <div className="price-details">
                                            <span className="unit-price">
                                                ${formatPrice(item.price)} 
                                                {item.isOnSale && <span className="sale-label">Sale Price</span>}
                                            </span>
                                            <span className="quantity-price">
                                                × {item.quantity} = ${formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        {/* Quantity adjustment controls */}
                                        <div className="quantity-controls">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        {/* Remove item button */}
                                        <button 
                                            className="remove-button"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Cart summary and checkout section - only shown when cart has items */}
                {cartItems.length > 0 && (
                    <div className="modal-footer">
                        <div className="cart-summary">
                            <div className="cart-total">
                                <span>Total:</span>
                                <span>${formatPrice(cartTotal)}</span>
                            </div>
                            <div className="cart-savings">
                                {cartItems.some(item => item.isOnSale) && (
                                    <span className="savings-text">
                                        Includes sale price savings!
                                    </span>
                                )}
                            </div>
                        </div>
                        <button className="checkout-button">
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal; 