import React from 'react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product, onImageClick, showToast }) => {
    const { addToCart } = useCart();
    const isOnSale = product.isOnSale && product.onSaleQuantity > 0;
    
    const calculateDiscount = (original, sale) => {
        return Math.round(((original - sale) / original) * 100);
    };

    const handleAddToCart = () => {
        addToCart(product);
        showToast('Item added to cart');
    };

    return (
        <div className="product-card">
            {isOnSale && (
                <div className="sale-badge">
                    {calculateDiscount(product.price, product.salePrice)}% OFF
                </div>
            )}
            <img 
                src={product.image} 
                alt={product.name} 
                className="product-image"
                onClick={() => onImageClick(product.image, product.name)}
            />
            <h2 className="product-name">{product.name}</h2>
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
