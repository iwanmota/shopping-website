/**
 * Homepage Component
 * 
 * Displays the main landing page of the application featuring special offers and sale items.
 * Fetches and displays products that are currently on sale.
 * 
 * @component
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Homepage.css';

/**
 * Homepage component displaying featured sale products
 * 
 * @param {Object} props - Component props
 * @param {Function} props.showToast - Function to display notification messages
 * @returns {React.ReactElement} Homepage component
 */
const Homepage = ({ showToast }) => {
    // State for sale products data and loading status
    const [saleProducts, setSaleProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Get cart functionality from context
    const { addToCart } = useCart();

    /**
     * Fetch sale products from the API on component mount
     * 
     * Retrieves only products that are on sale and have available sale quantity
     */
    useEffect(() => {
        fetch('http://localhost:3001/api/products/sale')
            .then(response => response.json())
            .then(data => {
                setSaleProducts(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

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
     * 
     * @param {Object} product - Product to add to cart
     */
    const handleAddToCart = (product) => {
        addToCart(product);
        showToast('Item added to cart');
    };

    // Show loading indicator while fetching products
    if (loading) return <div className="loading">Loading</div>;
    
    // Show error message if product fetch failed
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="homepage-container">
            {/* Sale banner section */}
            <div className="sale-banner">
                <h1>Special Offers</h1>
                <p>Don't miss out on these amazing deals!</p>
            </div>
            
            {/* Sale products grid */}
            <div className="sale-products">
                {saleProducts.map(product => (
                    <div key={product.id} className="sale-product-card">
                        {/* Discount badge showing percentage off */}
                        <div className="discount-badge">
                            {calculateDiscount(product.price, product.salePrice)}% OFF
                        </div>
                        
                        <img src={product.image} alt={product.name} className="product-image" />
                        
                        <div className="product-info">
                            <h2>{product.name}</h2>
                            
                            {/* Price display showing original and sale prices */}
                            <div className="price-container">
                                <span className="original-price">${product.price.toFixed(2)}</span>
                                <span className="sale-price">${product.salePrice.toFixed(2)}</span>
                            </div>
                            
                            {/* Limited quantity indicator */}
                            <p className="stock-info">Only {product.onSaleQuantity} left at this price!</p>
                            
                            {/* Add to cart button */}
                            <button 
                                className="add-to-cart-button"
                                onClick={() => handleAddToCart(product)}
                            >
                                Add to Cart <i className="fas fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Link to full product catalog */}
            <Link to="/products" className="view-all-button">
                View All Products <i className="fas fa-arrow-right"></i>
            </Link>
        </div>
    );
};

export default Homepage; 