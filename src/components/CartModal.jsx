import React from 'react';
import './CartModal.css';

const CartModal = ({ isOpen, onClose, cartItems = [] }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Shopping Cart</h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="cart-items">
                    {cartItems.length === 0 ? (
                        <p className="empty-cart">Your cart is empty</p>
                    ) : (
                        <ul>
                            {cartItems.map(item => (
                                <li key={item.id} className="cart-item">
                                    <div className="item-info">
                                        <h3>{item.name}</h3>
                                        <p className="price">${item.price}</p>
                                    </div>
                                    <button className="remove-button">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="modal-footer">
                    <div className="cart-total">
                        <span>Total:</span>
                        <span>${cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
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