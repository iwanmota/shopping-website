import React from 'react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product, onImageClick }) => {
    const { addToCart } = useCart();

    return (
        <div className="product-card">
            <img 
                src={product.image} 
                alt={product.name} 
                className="product-image"
                onClick={() => onImageClick(product.image, product.name)}
            />
            <h2 className="product-name">{product.name}</h2>
            <p className="product-price">${product.price}</p>
            <p className="product-description">{product.description}</p>
            <button 
                className="add-to-cart-button"
                onClick={() => addToCart(product)}
            >
                Add to Cart
            </button>
        </div>
    );
};

export default ProductCard;
