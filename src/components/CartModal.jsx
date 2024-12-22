import React from 'react';
import { useCart } from '../context/CartContext';
import './CartModal.css';

const CartModal = ({ isOpen, onClose }) => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

    if (!isOpen) return null;

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