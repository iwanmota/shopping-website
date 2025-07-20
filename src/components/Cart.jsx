/**
 * Cart Component
 * 
 * A simple shopping cart component that manages cart items with local state.
 * This appears to be an earlier version of the cart functionality that has been
 * replaced by the CartContext and CartModal components in the current implementation.
 * 
 * @component
 * @deprecated Use CartContext and CartModal instead for current cart functionality
 */
import React, { useState } from 'react';

/**
 * Cart component for displaying and managing cart items
 * 
 * @returns {React.ReactElement} Cart component with item list and controls
 */
const Cart = () => {
    // State to track cart items
    const [cartItems, setCartItems] = useState([]);

    /**
     * Add a product to the cart
     * 
     * @param {Object} product - Product to add to cart
     */
    const addToCart = (product) => {
        setCartItems([...cartItems, product]);
    };

    /**
     * Remove a product from the cart by ID
     * 
     * @param {number} id - ID of product to remove
     */
    const removeFromCart = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    return (
        <div>
            <h2>Your Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <p>No items in the cart.</p>
            ) : (
                <ul>
                    {cartItems.map(item => (
                        <li key={item.id}>
                            {item.name} - ${item.price}
                            <button onClick={() => removeFromCart(item.id)}>Remove</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Cart;