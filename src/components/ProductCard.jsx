/**
 * Product Card Component
 * 
 * Displays an individual product with its details, price information,
 * and purchase options. Handles special display for sale items.
 * 
 * @component
 */
import React from 'react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

/**
 * ProductCard component for displaying individual product information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data object
 * @param {number} props.product.id - Unique product identifier
 * @param {string} props.product.name - Product name
 * @param {number} props.product.price - Regular product price
 * @param {string} props.product.description - Product description
 * @param {string} props.product.image - Path to product image
 * @param {boolean} props.product.isOnSale - Whether product is on sale
 * @param {number} props.product.salePrice - Discounted sale price
 * @param {number} props.product.onSaleQuantity - Number of items available at sale price
 * @param {Function} props.onImageClick - Handler for image click to show enlarged view
 * @param {Function} props.showToast - Function to display notification messages
 * @returns {React.ReactElement} Product card component
 */
const ProductCard = ({ product, onImageClick, showToast }) => {
    // Get cart functionality from context
    const { addToCart } = useCart();
    
    // Determine if product is currently on sale with available quantity
    const isOnSale = product.isOnSale && product.onSaleQuantity > 0;
    
    /**
     * Calculate percentage discount between original and sale price
     * 
     * @param {number} original - Original product price
     * @param {number} sale - Sale price
     * @returns {number} Discount percentage rounded to nearest integer
     */
    const calculateDiscount = (original, sale) => {
        return Math.round(((original - sale) / original) * 100);
    };

    /**
     * Handle adding product to cart
     * Shows confirmation toast after adding
     */
    const handleAddToCart = () => {
        addToCart(product);
        showToast('Item added to cart');
    };

    return (
        <div className="product-card">
            {/* Sale badge shown only for sale items */}
            {isOnSale && (
                <div className="sale-badge">
                    {calculateDiscount(product.price, product.salePrice)}% OFF
                </div>
            )}
            
            {/* Product image with click handler for enlarged view */}
            <img 
                src={product.image} 
                alt={product.name} 
                className="product-image"
                onClick={() => onImageClick(product.image, product.name)}
            />
            
            <h2 className="product-name">{product.name}</h2>
            
            {/* Price display with special formatting for sale items */}
            <div className="price-info">
                {isOnSale ? (
                    <>
                        <span className="original-price">${product.price.toFixed(2)}</span>
                        <span className="sale-price">${product.salePrice.toFixed(2)}</span>
                        <span className="stock-info">
                            Only {product.onSaleQuantity} left at this price!
                        </span>
                    </>
                ) : (
                    <span className="regular-price">${product.price.toFixed(2)}</span>
                )}
            </div>
            
            <p className="product-description">{product.description}</p>
            
            {/* Add to cart button */}
            <button 
                className="add-to-cart-button"
                onClick={handleAddToCart}
            >
                Add to Cart
            </button>
        </div>
    );
};

export default ProductCard;
