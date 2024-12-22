import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Homepage.css';

const Homepage = ({ showToast }) => {
    const [saleProducts, setSaleProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();

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

    const calculateDiscount = (original, sale) => {
        return Math.round(((original - sale) / original) * 100);
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        showToast('Item added to cart');
    };

    if (loading) return <div className="loading">Loading</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="homepage-container">
            <div className="sale-banner">
                <h1>Special Offers</h1>
                <p>Don't miss out on these amazing deals!</p>
            </div>
            
            <div className="sale-products">
                {saleProducts.map(product => (
                    <div key={product.id} className="sale-product-card">
                        <div className="discount-badge">
                            {calculateDiscount(product.price, product.salePrice)}% OFF
                        </div>
                        <img src={product.image} alt={product.name} className="product-image" />
                        <div className="product-info">
                            <h2>{product.name}</h2>
                            <div className="price-container">
                                <span className="original-price">${product.price.toFixed(2)}</span>
                                <span className="sale-price">${product.salePrice.toFixed(2)}</span>
                            </div>
                            <p className="stock-info">Only {product.onSaleQuantity} left at this price!</p>
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

            <Link to="/products" className="view-all-button">
                View All Products <i className="fas fa-arrow-right"></i>
            </Link>
        </div>
    );
};

export default Homepage; 