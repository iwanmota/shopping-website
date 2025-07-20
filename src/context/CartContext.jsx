/**
 * Shopping Cart Context
 * 
 * This module provides a React Context for managing the shopping cart state across the application.
 * It handles adding/removing items, updating quantities, and calculating totals.
 * 
 * The implementation uses useReducer for state management with actions for different cart operations.
 * It also handles special logic for sale items with limited quantities.
 */
import React, { createContext, useContext, useReducer } from 'react';

// Create context for cart state
const CartContext = createContext();

/**
 * Cart state reducer function
 * 
 * Handles all cart state updates based on dispatched actions.
 * 
 * @param {Array} state - Current cart items array
 * @param {Object} action - Action object with type and payload
 * @returns {Array} Updated cart items array
 */
const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { id, price, salePrice, onSaleQuantity, isOnSale } = action.payload;
            const existingSaleItem = state.find(item => item.id === id && item.isOnSale);
            const existingRegularItem = state.find(item => item.id === id && !item.isOnSale);
            
            let updatedState = [...state];

            if (isOnSale && onSaleQuantity > 0) {
                // Handle sale item with available sale quantity
                if (existingSaleItem) {
                    // Item already in cart as a sale item
                    if (existingSaleItem.quantity < onSaleQuantity) {
                        // Can add more at sale price
                        updatedState = state.map(item =>
                            item.id === id && item.isOnSale
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        );
                    } else {
                        // Sale quantity exceeded, add as regular item
                        if (existingRegularItem) {
                            // Regular version already in cart, increment quantity
                            updatedState = state.map(item =>
                                item.id === id && !item.isOnSale
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            );
                        } else {
                            // Add new regular item
                            updatedState.push({ ...action.payload, isOnSale: false, price, quantity: 1 });
                        }
                    }
                } else {
                    // Add new sale item
                    updatedState.push({ ...action.payload, price: salePrice, isOnSale: true, quantity: 1 });
                }
            } else {
                // Handle regular item (not on sale or sale quantity depleted)
                if (existingRegularItem) {
                    // Regular item already in cart, increment quantity
                    updatedState = state.map(item =>
                        item.id === id && !item.isOnSale
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    // Add new regular item
                    updatedState.push({ ...action.payload, isOnSale: false, quantity: 1 });
                }
            }

            return updatedState;
        }

        case 'REMOVE_ITEM':
            // Remove all instances of an item from cart by ID
            return state.filter(item => item.id !== action.payload);

        case 'UPDATE_QUANTITY':
            // Update quantity for a specific item
            return state.map(item =>
                item.id === action.payload.id
                    ? { ...item, quantity: action.payload.quantity }
                    : item
            );

        case 'CLEAR_CART':
            // Empty the cart completely
            return [];

        default:
            return state;
    }
};

/**
 * Cart Context Provider Component
 * 
 * Provides cart state and operations to all child components.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 */
export const CartProvider = ({ children }) => {
    // Initialize cart state with reducer
    const [cartItems, dispatch] = useReducer(cartReducer, []);

    /**
     * Add a product to the cart
     * 
     * @param {Object} product - Product to add to cart
     */
    const addToCart = (product) => {
        dispatch({ type: 'ADD_ITEM', payload: product });
    };

    /**
     * Remove a product from the cart
     * 
     * @param {number} productId - ID of product to remove
     */
    const removeFromCart = (productId) => {
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
    };

    /**
     * Update quantity of a product in the cart
     * Removes item if quantity is less than 1
     * 
     * @param {number} productId - ID of product to update
     * @param {number} quantity - New quantity value
     */
    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    };

    /**
     * Clear all items from the cart
     */
    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    /**
     * Calculate total price of all items in cart
     */
    const cartTotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

/**
 * Custom hook to access cart context
 * 
 * @returns {Object} Cart context value
 * @throws {Error} If used outside of CartProvider
 */
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 