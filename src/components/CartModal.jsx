import React from 'react';
import { useCart } from '../context/CartContext';
import './CartModal.css';

const CartModal = ({ isOpen, onClose }) => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

    if (!isOpen) return null;

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
                                <li key={item.id} className="cart-item">
                                    <div className="item-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="item-info">
                                        <h3>{item.name}</h3>
                                        <p className="price">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="item-actions">
                                        <div className="quantity-controls">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
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

                <div className="modal-footer">
                    <div className="cart-total">
                        <span>Total:</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <button className="checkout-button" disabled={cartItems.length === 0}>
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartModal; 