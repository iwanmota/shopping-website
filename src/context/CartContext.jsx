import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { id, price, salePrice, onSaleQuantity, isOnSale } = action.payload;
            const existingSaleItem = state.find(item => item.id === id && item.isOnSale);
            const existingRegularItem = state.find(item => item.id === id && !item.isOnSale);
            
            let updatedState = [...state];

            if (isOnSale && onSaleQuantity > 0) {
                // Handle sale item
                if (existingSaleItem) {
                    if (existingSaleItem.quantity < onSaleQuantity) {
                        updatedState = state.map(item =>
                            item.id === id && item.isOnSale
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        );
                    } else {
                        // Add as regular item if sale quantity is exceeded
                        if (existingRegularItem) {
                            updatedState = state.map(item =>
                                item.id === id && !item.isOnSale
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            );
                        } else {
                            updatedState.push({ ...action.payload, isOnSale: false, price, quantity: 1 });
                        }
                    }
                } else {
                    updatedState.push({ ...action.payload, price: salePrice, isOnSale: true, quantity: 1 });
                }
            } else {
                // Handle regular item
                if (existingRegularItem) {
                    updatedState = state.map(item =>
                        item.id === id && !item.isOnSale
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    updatedState.push({ ...action.payload, isOnSale: false, quantity: 1 });
                }
            }

            return updatedState;
        }

        case 'REMOVE_ITEM':
            return state.filter(item => item.id !== action.payload);

        case 'UPDATE_QUANTITY':
            return state.map(item =>
                item.id === action.payload.id
                    ? { ...item, quantity: action.payload.quantity }
                    : item
            );

        case 'CLEAR_CART':
            return [];

        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [cartItems, dispatch] = useReducer(cartReducer, []);

    const addToCart = (product) => {
        dispatch({ type: 'ADD_ITEM', payload: product });
    };

    const removeFromCart = (productId) => {
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

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

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 